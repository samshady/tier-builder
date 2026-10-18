export type ItemType = 'image' | 'text';

export interface TierItem {
  id: string;
  type: ItemType;
  title: string;
  imageUrl?: string;
  color?: string; // For text cards
  tag?: string;
  createdAt: number;
}

export interface Tier {
  id: string;
  label: string;
  color: string;
  itemIds: string[];
}

export interface Board {
  id: string;
  title: string;
  author?: string;
  tiers: Tier[];
  unrankedItemIds: string[];
  items: Record<string, TierItem>;
  createdAt: number;
  updatedAt: number;
}

export interface GauntletComparison {
  itemA: TierItem;
  itemB: TierItem;
}

export const DEFAULT_TIER_COLORS = [
  '#f38ba8', // S: Rose / Red
  '#fab387', // A: Peach / Orange
  '#f9e2af', // B: Amber / Yellow
  '#a6e3a1', // C: Emerald / Green
  '#89b4fa', // D: Sky / Blue
  '#cba6f7', // F: Mauve / Purple
];
