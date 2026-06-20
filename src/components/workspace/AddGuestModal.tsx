import { useState, useRef, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import type { Guest, GuestRelation } from '../../types';

interface Props {
  onClose: () => void;
  onAdd: (guest: Omit<Guest, 'id'>, linkedGuestIds: string[]) => Promise<void>;
  existingLabels: string[];
  allGuests: Guest[];
}

const RELATION_OPTIONS: GuestRelation[] = ['דניאל', 'בר', 'הורים דניאל', 'הורים בר'];

const DEFAULT_GUEST: Omit<Guest, 'id'> = {
  firstName: '',
  lastName: '',
  relatedTo: 'דניאל',
  isVegan: false,
  hasKids: false,
  kidsCount: 0,
  phoneNumber: '',
  tableLabel: '',
  status: 'Pending',
  giftAmount: 0,
};

export default function AddGuestModal({ onClose, onAdd, existingLabels, allGuests }: Props) {
  const [form, setForm] = useState<Omit<Guest, 'id'>>(DEFAULT_GUEST);
  const [saving, setSaving] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [linkedGuestIds, setLinkedGuestIds] = useState<Set<string>>(new Set());
  const [linkSearch, setLinkSearch] = useState('');
  const [duplicateError, setDuplicateError] = useState(false);
  const firstNameRef = useRef<HTMLInputElement>(null);

  const sortedGuests = useMemo(() =>
    [...allGuests].sort((a, b) => {
      const lastCmp = (a.lastName || '').localeCompare(b.lastName || '', 'he');
      if (lastCmp !== 0) return lastCmp;
      return (a.firstName || '').localeCompare(b.firstName || '', 'he');
    }),
    [allGuests]
  );

  const filteredLinkGuests = useMemo(() => {
    if (!linkSearch.trim()) return sortedGuests;
    const q = linkSearch.toLowerCase();
    return sortedGuests.filter(g =>
      `${g.firstName} ${g.lastName}`.toLowerCase().includes(q)
    );
  }, [sortedGuests, linkSearch]);

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'firstName' || key === 'lastName') setDuplicateError(false);
  }

  function toggleLink(id: string) {
    setLinkedGuestIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function save(andClose: boolean) {
    if (!form.firstName.trim()) return;
    const first = form.firstName.trim().toLowerCase();
    const last = form.lastName.trim().toLowerCase();
    const isDuplicate = allGuests.some(
      g => g.firstName.trim().toLowerCase() === first && g.lastName.trim().toLowerCase() === last
    );
    if (isDuplicate) { setDuplicateError(true); return; }
    setSaving(true);
    await onAdd({ ...form, kidsCount: form.hasKids ? form.kidsCount : 0 }, [...linkedGuestIds]);
    setSaving(false);
    if (andClose) {
      onClose();
    } else {
      setForm(DEFAULT_GUEST);
      setLinkedGuestIds(new Set());
      setLinkSearch('');
      setDuplicateError(false);
      setAddedCount((n) => n + 1);
      setTimeout(() => firstNameRef.current?.focus(), 50);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await save(true);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">הוספת אורח</h2>
            {addedCount > 0 && (
              <p className="text-xs text-green-600 mt-0.5">✓ {addedCount} אורחים נוספו</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם פרטי <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstNameRef}
                type="text"
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${duplicateError ? 'border-red-400 focus:ring-red-400' : 'focus:ring-indigo-400'}`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם משפחה</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${duplicateError ? 'border-red-400 focus:ring-red-400' : 'focus:ring-indigo-400'}`}
              />
            </div>
          </div>
          {duplicateError && (
            <p className="text-xs text-red-500 -mt-2">אורח עם שם זה כבר קיים ברשימה</p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">קשור ל</label>
            <select
              value={form.relatedTo}
              onChange={(e) => set('relatedTo', e.target.value as GuestRelation)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {RELATION_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => set('phoneNumber', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שולחן / קבוצה</label>
            <input
              type="text"
              list="table-labels"
              value={form.tableLabel}
              onChange={(e) => set('tableLabel', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder='למשל: "החברים מהצבא"'
            />
            <datalist id="table-labels">
              {existingLabels.map((label) => (
                <option key={label} value={label} />
              ))}
            </datalist>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isVegan}
                onChange={(e) => set('isVegan', e.target.checked)}
                className="w-4 h-4 accent-green-500"
              />
              <span className="text-sm text-gray-700">טבעוני / צמחוני</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasKids}
                onChange={(e) => set('hasKids', e.target.checked)}
                className="w-4 h-4 accent-indigo-500"
              />
              <span className="text-sm text-gray-700">מגיע עם ילדים</span>
            </label>
          </div>

          {form.hasKids && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מספר ילדים</label>
              <input
                type="number"
                min={1}
                value={form.kidsCount}
                onChange={(e) => set('kidsCount', parseInt(e.target.value) || 0)}
                className="w-32 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}

          {allGuests.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                קישור לאורחים
                {linkedGuestIds.size > 0 && (
                  <span className="mr-1 text-indigo-600 font-normal">({linkedGuestIds.size} נבחרו)</span>
                )}
              </label>
              <div className="relative mb-2">
                <Search size={13} className="absolute right-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="חיפוש אורח..."
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  className="w-full border rounded-lg pr-9 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="border rounded-lg max-h-36 overflow-y-auto">
                {filteredLinkGuests.length === 0 ? (
                  <p className="text-center text-gray-400 py-3 text-xs">לא נמצאו תוצאות</p>
                ) : (
                  filteredLinkGuests.map(g => (
                    <label key={g.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0">
                      <input
                        type="checkbox"
                        checked={linkedGuestIds.has(g.id)}
                        onChange={() => toggleLink(g.id)}
                        className="accent-indigo-600 w-4 h-4 shrink-0"
                      />
                      <span className="text-sm text-gray-800 flex-1">{g.firstName} {g.lastName}</span>
                      <span className="text-xs text-gray-400">{g.relatedTo}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => save(false)}
              disabled={saving || !form.firstName.trim()}
              className="flex-1 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 font-medium py-2.5 rounded-xl transition-colors"
            >
              {saving ? 'שומר...' : 'הוסף ועבור לבא'}
            </button>
            <button
              type="submit"
              disabled={saving || !form.firstName.trim()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              {saving ? 'שומר...' : 'הוסף וסגור'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
