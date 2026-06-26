import { useState, useMemo } from 'react';
import { X, Link2, Search } from 'lucide-react';
import type { Guest } from '../../types';
import type { GroupColor } from '../../utils/groupColors';

interface Props {
  guest: Guest;
  allGuests: Guest[];
  groupColorMap: Map<string, GroupColor>;
  onClose: () => void;
  onSave: (selectedIds: string[]) => Promise<void>;
}

export default function LinkGuestsModal({ guest, allGuests, groupColorMap, onClose, onSave }: Props) {
  const currentGroupId = guest.relationGroupId;
  const initialSelected = currentGroupId
    ? new Set(allGuests.filter(g => g.relationGroupId === currentGroupId && g.id !== guest.id).map(g => g.id))
    : new Set<string>();

  const [selected, setSelected] = useState<Set<string>>(initialSelected);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const others = useMemo(() =>
    allGuests
      .filter(g => g.id !== guest.id)
      .sort((a, b) => {
        const lastCmp = (a.lastName || '').localeCompare(b.lastName || '', 'he');
        if (lastCmp !== 0) return lastCmp;
        return (a.firstName || '').localeCompare(b.firstName || '', 'he');
      }),
    [allGuests, guest.id]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return others;
    const q = search.toLowerCase();
    return others.filter(g =>
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(q)
    );
  }, [others, search]);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    await onSave([...selected]);
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" dir="rtl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Link2 size={17} className="text-indigo-500" />
            <h2 className="text-base font-semibold text-gray-800">
              קשרים — {guest.firstName} {guest.lastName}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-3 pb-2 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-400">סמן את האורחים הקשורים לאורח זה.</p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelected(new Set(others.map(g => g.id)))}
              className="text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors"
            >
              בחר הכל
            </button>
            {guest.relationGroupId && (
              <button
                onClick={async () => { setSaving(true); await onSave([]); setSaving(false); onClose(); }}
                disabled={saving}
                className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
              >
                הסר מכל הקשרים
              </button>
            )}
          </div>
        </div>

        <div className="px-4 pb-1">
          <div className="relative">
            <Search size={13} className="absolute right-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש אורח..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-lg pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-3 py-2">
          {others.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">אין אורחים אחרים</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">לא נמצאו תוצאות</p>
          ) : (
            <div className="space-y-0.5">
              {filtered.map(g => {
                const color = g.relationGroupId ? groupColorMap.get(g.relationGroupId) : undefined;
                return (
                  <label
                    key={g.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(g.id)}
                      onChange={() => toggle(g.id)}
                      className="accent-indigo-600 w-4 h-4 shrink-0"
                    />
                    {color && (
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color.dot }}
                      />
                    )}
                    <span className="text-sm text-gray-800 flex-1">
                      {g.firstName} {g.lastName}
                    </span>
                    <span className="text-xs text-gray-400">{g.relatedTo}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-4 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? 'שומר...' : `שמור${selected.size > 0 ? ` (${selected.size + 1} אורחים)` : ''}`}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl transition-colors"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
