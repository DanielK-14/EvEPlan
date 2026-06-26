import { useState } from 'react';
import { X } from 'lucide-react';
import type { Guest, GuestRelation } from '../../types';
import { formatPhone, isPhoneComplete } from '../../utils/phone';

interface Props {
  guest: Guest;
  existingLabels: string[];
  allGuests: Guest[];
  onClose: () => void;
  onSave: (patch: Partial<Guest>) => Promise<void>;
}

const RELATION_OPTIONS: GuestRelation[] = ['דניאל', 'בר', 'הורים דניאל', 'הורים בר'];

export default function GuestEditModal({ guest, existingLabels, allGuests, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    firstName: guest.firstName,
    lastName: guest.lastName,
    relatedTo: guest.relatedTo,
    phoneNumber: guest.phoneNumber,
    tableLabel: guest.tableLabel,
    isVegan: guest.isVegan,
    hasKids: guest.hasKids,
    kidsCount: guest.kidsCount,
  });
  const [saving, setSaving] = useState(false);
  const [duplicateError, setDuplicateError] = useState(false);
  const [phoneError, setPhoneError] = useState<'duplicate' | 'format' | null>(null);

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'firstName' || key === 'lastName') setDuplicateError(false);
    if (key === 'phoneNumber') setPhoneError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim()) return;
    const first = form.firstName.trim().toLowerCase();
    const last = form.lastName.trim().toLowerCase();
    const isDuplicate = allGuests.some(
      g => g.id !== guest.id &&
        g.firstName.trim().toLowerCase() === first &&
        g.lastName.trim().toLowerCase() === last
    );
    if (isDuplicate) { setDuplicateError(true); return; }
    if (!isPhoneComplete(form.phoneNumber)) { setPhoneError('format'); return; }
    const phoneDigits = form.phoneNumber.replace(/\D/g, '');
    if (phoneDigits && allGuests.some(g => g.id !== guest.id && g.phoneNumber.replace(/\D/g, '') === phoneDigits)) {
      setPhoneError('duplicate'); return;
    }
    setSaving(true);
    await onSave({ ...form, kidsCount: form.hasKids ? form.kidsCount : 0 });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-800">
            עריכת אורח — {guest.firstName} {guest.lastName}
          </h2>
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
                type="text"
                value={form.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${duplicateError ? 'border-red-400 focus:ring-red-400' : 'focus:ring-indigo-400'}`}
                required
                autoFocus
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
              onChange={(e) => set('phoneNumber', formatPhone(e.target.value))}
              placeholder="050-1234-567"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${phoneError ? 'border-red-400 focus:ring-red-400' : 'focus:ring-indigo-400'}`}
              dir="ltr"
            />
            {phoneError === 'duplicate' && (
              <p className="text-xs text-red-500 mt-1">מספר טלפון זה כבר קיים ברשימה</p>
            )}
            {phoneError === 'format' && (
              <p className="text-xs text-red-500 mt-1">פורמט לא תקין — נדרש XXX-XXXX-XXX</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שולחן / קבוצה</label>
            <input
              type="text"
              list="edit-table-labels"
              value={form.tableLabel}
              onChange={(e) => set('tableLabel', e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <datalist id="edit-table-labels">
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

          <div className="mt-2">
            <button
              type="submit"
              disabled={saving || !form.firstName.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors"
            >
              {saving ? 'שומר...' : 'שמור שינויים'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
