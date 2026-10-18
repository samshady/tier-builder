import { toPng } from 'html-to-image';
import * as fflate from 'fflate';
import LZString from 'lz-string';
import type { Board, Tier, TierItem } from '../types/index.ts';
import { DEFAULT_TIER_COLORS } from '../types/index.ts';

const DEFAULT_TIER_LABELS = ['S', 'A', 'B', 'C', 'D', 'F'];

function isStandardTiers(tiers: Tier[]): boolean {
  if (tiers.length !== 6) return false;
  return tiers.every(
    (t, idx) => t.label === DEFAULT_TIER_LABELS[idx] && t.color === DEFAULT_TIER_COLORS[idx]
  );
}

function u8ToBase64Url(u8: Uint8Array): string {
  let binary = '';
  const len = u8.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(u8[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToU8(b64url: string): Uint8Array {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) {
    b64 += '=';
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Compresses board data into an ultra-compact URL-safe hash string.
 * Uses schema v2 with fflate raw deflate compression and base64url encoding.
 */
export function encodeBoardToUrlHash(board: Board): string {
  // Collect item IDs in display order: all tier items followed by unranked items
  const orderedIds: string[] = [];
  board.tiers.forEach((t) =>
    t.itemIds.forEach((id) => {
      if (!orderedIds.includes(id) && board.items[id]) orderedIds.push(id);
    })
  );
  board.unrankedItemIds.forEach((id) => {
    if (!orderedIds.includes(id) && board.items[id]) orderedIds.push(id);
  });
  // Append any lingering item in board.items
  Object.keys(board.items).forEach((id) => {
    if (!orderedIds.includes(id)) orderedIds.push(id);
  });

  const itemEntries = orderedIds.map((id) => board.items[id]);
  const idToIndex = new Map<string, number>();
  itemEntries.forEach((item, idx) => idToIndex.set(item.id, idx));

  const standard = isStandardTiers(board.tiers);

  const tiersPayload = board.tiers.map((t) => {
    const indices = t.itemIds
      .map((id) => idToIndex.get(id))
      .filter((i): i is number => i !== undefined);
    return standard ? indices : ([t.label, t.color, indices] as [string, string, number[]]);
  });

  const allRankedIndices = new Set<number>();
  board.tiers.forEach((t) =>
    t.itemIds.forEach((id) => {
      const idx = idToIndex.get(id);
      if (idx !== undefined) allRankedIndices.add(idx);
    })
  );

  const expectedUnranked: number[] = [];
  itemEntries.forEach((_, idx) => {
    if (!allRankedIndices.has(idx)) expectedUnranked.push(idx);
  });

  const actualUnranked = board.unrankedItemIds
    .map((id) => idToIndex.get(id))
    .filter((i): i is number => i !== undefined);

  const unrankedMatchesDefault =
    actualUnranked.length === expectedUnranked.length &&
    actualUnranked.every((idx, i) => idx === expectedUnranked[i]);

  const itemsPayload = itemEntries.map((item) => {
    // If plain text with default color and no tag, just store title string
    if (item.type === 'text' && (!item.color || item.color === '#cba6f7') && !item.tag) {
      return item.title;
    }
    return {
      t: item.title,
      ...(item.type !== 'text' ? { y: item.type } : {}),
      ...(item.imageUrl ? { u: item.imageUrl } : {}),
      ...(item.color && item.color !== '#cba6f7' ? { c: item.color } : {}),
      ...(item.tag ? { g: item.tag } : {}),
    };
  });

  const hasRankedItems = tiersPayload.some((entry) => {
    if (Array.isArray(entry) && typeof entry[0] === 'number') {
      return (entry as number[]).length > 0;
    }
    if (Array.isArray(entry) && Array.isArray((entry as any)[2])) {
      return (entry as any)[2].length > 0;
    }
    return false;
  });

  const payload = {
    v: 2,
    t: board.title,
    ...(board.author && board.author !== 'Curator' ? { a: board.author } : {}),
    r: standard ? (hasRankedItems ? (tiersPayload as number[][]) : undefined) : tiersPayload,
    u: unrankedMatchesDefault ? undefined : actualUnranked,
    k: itemsPayload,
  };

  const jsonStr = JSON.stringify(payload);
  const compressed = fflate.deflateSync(fflate.strToU8(jsonStr), { level: 9 });
  return 'v2.' + u8ToBase64Url(compressed);
}

/**
 * Decodes board data from a URL hash string.
 * Supports both modern v2 compact format and legacy LZString format.
 */
export function decodeBoardFromUrlHash(hash: string): Board | null {
  try {
    let clean = hash.trim().split('&')[0].replace(/\/+$/, '');
    try {
      clean = decodeURIComponent(clean);
    } catch {
      // Ignore malformed URI sequence and keep raw string
    }

    // Modern v2 format with fflate
    if (clean.startsWith('v2.')) {
      const raw = clean.slice(3);
      const bytes = base64UrlToU8(raw);
      const decompressed = fflate.inflateSync(bytes);
      const payload = JSON.parse(fflate.strFromU8(decompressed));

      const itemsMap: Record<string, TierItem> = {};
      const itemIds: string[] = [];

      payload.k.forEach((entry: any, idx: number) => {
        const id = `item-${idx}-${Math.random().toString(36).substring(2, 7)}`;
        itemIds.push(id);

        if (typeof entry === 'string') {
          itemsMap[id] = {
            id,
            type: 'text',
            title: entry,
            color: '#cba6f7',
            createdAt: Date.now(),
          };
        } else {
          itemsMap[id] = {
            id,
            type: entry.y || 'text',
            title: entry.t || 'Item',
            imageUrl: entry.u,
            color: entry.c || '#cba6f7',
            tag: entry.g,
            createdAt: Date.now(),
          };
        }
      });

      let tiers: Tier[] = [];

      if (!payload.r || payload.r.length === 0) {
        // Default empty tiers
        tiers = DEFAULT_TIER_LABELS.map((label, idx) => ({
          id: `tier-${label.toLowerCase()}`,
          label,
          color: DEFAULT_TIER_COLORS[idx],
          itemIds: [],
        }));
      } else if (
        payload.r.length > 0 &&
        Array.isArray(payload.r[0]) &&
        (payload.r[0].length === 0 || typeof payload.r[0][0] === 'number')
      ) {
        // Standard tiers with item indices
        tiers = DEFAULT_TIER_LABELS.map((label, idx) => ({
          id: `tier-${label.toLowerCase()}`,
          label,
          color: DEFAULT_TIER_COLORS[idx],
          itemIds: ((payload.r as number[][])[idx] || [])
            .map((i) => itemIds[i])
            .filter(Boolean),
        }));
      } else {
        // Custom tiers: [label, color, indices]
        tiers = (payload.r as [string, string, number[]][]).map((t, idx) => ({
          id: `tier-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          label: t[0],
          color: t[1],
          itemIds: (t[2] || []).map((i) => itemIds[i]).filter(Boolean),
        }));
      }

      let unrankedItemIds: string[] = [];
      if (Array.isArray(payload.u)) {
        unrankedItemIds = payload.u.map((i: number) => itemIds[i]).filter(Boolean);
      } else {
        const rankedSet = new Set(tiers.flatMap((t) => t.itemIds));
        unrankedItemIds = itemIds.filter((id) => !rankedSet.has(id));
      }

      return {
        id: `shared-${Date.now()}`,
        title: payload.t || 'Shared Tier List',
        author: payload.a || 'Curator',
        tiers,
        unrankedItemIds,
        items: itemsMap,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    // Legacy v1 format with LZString
    let jsonStr = LZString.decompressFromEncodedURIComponent(clean);
    if (!jsonStr && clean.includes(' ')) {
      jsonStr = LZString.decompressFromEncodedURIComponent(clean.replace(/ /g, '+'));
    }
    if (!jsonStr) return null;

    const payload = JSON.parse(jsonStr);
    const itemsMap: Record<string, TierItem> = {};

    if (Array.isArray(payload.k)) {
      payload.k.forEach((item: any) => {
        itemsMap[item.i] = {
          id: item.i,
          type: item.y || 'text',
          title: item.t,
          imageUrl: item.u,
          color: item.c,
          tag: item.g,
          createdAt: Date.now(),
        };
      });
    }

    return {
      id: `shared-${Date.now()}`,
      title: payload.t || 'Shared Tier List',
      author: payload.a || 'Curator',
      tiers: (payload.r || []).map((tier: any) => ({
        id: tier.i,
        label: tier.l,
        color: tier.c,
        itemIds: tier.m || [],
      })),
      unrankedItemIds: payload.u || [],
      items: itemsMap,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  } catch (err) {
    console.error('Failed to parse board from URL hash:', err);
    return null;
  }
}

/**
 * Shortens a URL using da.gd with CORS support.
 * Returns null if network fails or offline.
 */
export async function shortenUrl(longUrl: string): Promise<string | null> {
  try {
    const res = await fetch(`https://da.gd/s?url=${encodeURIComponent(longUrl)}`);
    if (res.ok) {
      const short = (await res.text()).trim();
      if (short.startsWith('http')) return short;
    }
  } catch {
    // Network failure or offline
  }
  return null;
}

/**
 * Exports DOM node to a crisp high-resolution PNG image file.
 */
export async function exportBoardToPng(element: HTMLElement, fileName: string): Promise<string> {
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#181825',
    style: {
      borderRadius: '0px',
    },
  });

  const link = document.createElement('a');
  link.download = `${fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-tierlist.png`;
  link.href = dataUrl;
  link.click();
  return dataUrl;
}

/**
 * Exports board as a downloadable JSON file.
 */
export function exportBoardToJson(board: Board): void {
  const blob = new Blob([JSON.stringify(board, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${board.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-backup.tier.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}
