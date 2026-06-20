import type { Guest } from '../types';

export interface GroupColor {
  dot: string;
  bg: string;
  text: string;
}

const PALETTE: GroupColor[] = [
  { dot: '#60a5fa', bg: '#eff6ff', text: '#1d4ed8' },
  { dot: '#34d399', bg: '#ecfdf5', text: '#065f46' },
  { dot: '#fb7185', bg: '#fff1f2', text: '#9f1239' },
  { dot: '#fbbf24', bg: '#fffbeb', text: '#78350f' },
  { dot: '#a78bfa', bg: '#f5f3ff', text: '#4c1d95' },
  { dot: '#fb923c', bg: '#fff7ed', text: '#9a3412' },
  { dot: '#2dd4bf', bg: '#f0fdfa', text: '#134e4a' },
  { dot: '#f472b6', bg: '#fdf4ff', text: '#86198f' },
  { dot: '#a3e635', bg: '#f7fee7', text: '#3f6212' },
  { dot: '#818cf8', bg: '#eef2ff', text: '#312e81' },
  { dot: '#22d3ee', bg: '#ecfeff', text: '#155e75' },
  { dot: '#facc15', bg: '#fefce8', text: '#713f12' },
  { dot: '#4ade80', bg: '#f0fdf4', text: '#166534' },
  { dot: '#94a3b8', bg: '#f8fafc', text: '#334155' },
  { dot: '#c084fc', bg: '#faf5ff', text: '#581c87' },
];

export function buildGroupColorMap(guests: Guest[]): Map<string, GroupColor> {
  const map = new Map<string, GroupColor>();
  let idx = 0;
  for (const g of guests) {
    if (g.relationGroupId && !map.has(g.relationGroupId)) {
      map.set(g.relationGroupId, PALETTE[idx % PALETTE.length]);
      idx++;
    }
  }
  return map;
}
