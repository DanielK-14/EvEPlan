import { computeKPIs } from '../../utils/calculations';
import { formatShekel } from '../../utils/formatters';
import type { Guest, FinanceConfig } from '../../types';

interface Props {
  guests: Guest[];
  config: FinanceConfig;
}

export default function KPIGrid({ guests, config }: Props) {
  const attractionTotal = config.attractions.reduce((s, a) => s + (a.price ?? 0), 0);
  const kpis = computeKPIs(guests, config.dishPrice, attractionTotal);

  const arrived    = guests.filter((g) => g.status === 'Arrived').length;
  const pending    = guests.filter((g) => g.status === 'Pending').length;
  const notArrived = guests.filter((g) => g.status === 'Not Arrived').length;
  const total      = guests.length;
  const vegans     = guests.filter((g) => g.isVegan).length;

  const arrivedPct = total ? Math.round((arrived / total) * 100) : 0;

  const isProfit = kpis.netProfitLoss >= 0;

  return (
    <div className="space-y-4">
      {/* Guest composition box */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs text-gray-500 mb-2">הרכב אורחים</p>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-5xl font-bold text-gray-800 leading-none">{kpis.totalInvited}</p>
            <p className="text-xs text-gray-400 mt-1">סה"כ מוזמנים</p>
          </div>
          <div className="h-14 w-px bg-gray-100" />
          <div className="flex gap-6 flex-wrap">
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-700">{kpis.adultsCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">🧑 מבוגרים</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-700">{kpis.childrenCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">👶 ילדים</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-green-600">{vegans}</p>
              <p className="text-xs text-gray-400 mt-0.5">🥗 טבעונים</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status breakdown box */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs text-gray-500 mb-3">סטטוס הגעה</p>
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-100">
          <div className="px-4 first:pr-0 last:pl-0 text-center">
            <p className="text-2xl font-bold text-green-600">{arrived}</p>
            <p className="text-xs text-gray-500 mt-0.5">הגיעו</p>
          </div>
          <div className="px-4 text-center">
            <p className="text-2xl font-bold text-yellow-500">{pending}</p>
            <p className="text-xs text-gray-500 mt-0.5">ממתינים</p>
          </div>
          <div className="px-4 first:pr-0 last:pl-0 text-center">
            <p className="text-2xl font-bold text-red-500">{notArrived}</p>
            <p className="text-xs text-gray-500 mt-0.5">לא הגיעו</p>
          </div>
        </div>
        {total > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>הגיעו {arrivedPct}%</span>
              <span>{arrived} מתוך {total}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
              <div className="bg-green-500 h-full transition-all" style={{ width: `${total ? (arrived / total) * 100 : 0}%` }} />
              <div className="bg-yellow-400 h-full transition-all" style={{ width: `${total ? (pending / total) * 100 : 0}%` }} />
              <div className="bg-red-400 h-full transition-all" style={{ width: `${total ? (notArrived / total) * 100 : 0}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Financial box */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs text-gray-500 mb-4">סיכום פיננסי</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">💸 סך הוצאות</p>
            <p className="text-xl font-bold text-gray-800">{formatShekel(kpis.totalExpenses)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">🎁 סך הכנסות</p>
            <p className="text-xl font-bold text-gray-800">{formatShekel(kpis.totalRevenue)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">🎯 מומלץ לאורח</p>
            <p className="text-xl font-bold text-gray-800">{formatShekel(kpis.targetPerHead)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">
              {isProfit ? '✅ רווח נקי' : '❌ הפסד נקי'}
            </p>
            <p className={`text-xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
              {isProfit ? '+' : '-'}{formatShekel(Math.abs(kpis.netProfitLoss))}
            </p>
          </div>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          {kpis.totalExpenses > 0 && (
            <div
              className={`h-full rounded-full transition-all ${isProfit ? 'bg-green-500' : 'bg-red-400'}`}
              style={{ width: `${Math.min((kpis.totalRevenue / kpis.totalExpenses) * 100, 100)}%` }}
            />
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {kpis.totalExpenses > 0
            ? `כוסו ${Math.min(Math.round((kpis.totalRevenue / kpis.totalExpenses) * 100), 100)}% מההוצאות`
            : 'לא הוגדרו הוצאות עדיין'}
        </p>
      </div>
    </div>
  );
}
