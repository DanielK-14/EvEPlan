import type { Guest } from '../types';
import { safeDiv } from './formatters';

export interface KPIs {
  totalInvited: number;
  adultsCount: number;
  childrenCount: number;
  totalExpenses: number;
  targetPerHead: number;
  totalRevenue: number;
  netProfitLoss: number;
}

export function computeKPIs(
  guests: Guest[],
  dishPrice: number,
  attractionTotal: number
): KPIs {
  const adultsCount = guests.length;
  const childrenCount = guests.reduce((sum, g) => sum + (g.hasKids ? (g.kidsCount ?? 0) : 0), 0);
  const totalInvited = adultsCount + childrenCount;
  const totalExpenses = adultsCount * (dishPrice ?? 0) + attractionTotal;
  const targetPerHead = safeDiv(totalExpenses, totalInvited);
  const totalRevenue = guests
    .filter((g) => g.status === 'Arrived')
    .reduce((sum, g) => sum + (g.giftAmount ?? 0), 0);
  const netProfitLoss = totalRevenue - totalExpenses;

  return { totalInvited, adultsCount, childrenCount, totalExpenses, targetPerHead, totalRevenue, netProfitLoss };
}
