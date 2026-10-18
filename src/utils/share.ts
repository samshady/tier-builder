import { toPng } from 'html-to-image';
import LZString from 'lz-string';
import type { Board } from '../types';


/**
 * Compresses board data into a URL-safe encoded hash string.
 */
export function encodeBoardToUrlHash(board: Board): string {
  // We strip unnecessary fields to keep string compact
  const payload = {
    t: board.title,
    a: board.author,
    r: board.tiers.map(tier => ({
      i: tier.id,
      l: tier.label,
      c: tier.color,
      m: tier.itemIds,
    })),
    u: board.unrankedItemIds,
    k: Object.values(board.items).map(item => ({
      i: item.id,
      y: item.type,
      t: item.title,
      u: item.imageUrl,
      c: item.color,
      g: item.tag,
    })),
  };

  const jsonStr = JSON.stringify(payload);
  return LZString.compressToEncodedURIComponent(jsonStr);
}

/**
 * Decodes board data from a URL hash string.
 */
export function decodeBoardFromUrlHash(hash: string): Board | null {
  try {
    const jsonStr = LZString.decompressFromEncodedURIComponent(hash);
    if (!jsonStr) return null;

    const payload = JSON.parse(jsonStr);
    const itemsMap: Record<string, any> = {};

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
      tiers: payload.r.map((tier: any) => ({
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
 * Exports DOM node to a crisp Retina PNG file.
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
