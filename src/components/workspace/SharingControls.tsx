import { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import type { SharingRules } from '../../types';

interface Props {
  rules: SharingRules;
  onSave: (rules: SharingRules) => Promise<void>;
}

function EmailList({
  label,
  description,
  emails,
  onAdd,
  onRemove,
}: {
  label: string;
  description: string;
  emails: string[];
  onAdd: (email: string) => void;
  onRemove: (email: string) => void;
}) {
  const [input, setInput] = useState('');

  function handleAdd() {
    const email = input.trim().toLowerCase();
    if (!email || emails.includes(email)) return;
    onAdd(email);
    setInput('');
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-700">{label}</h3>
      <p className="text-xs text-gray-400 mb-4">{description}</p>
      <div className="flex gap-2 mb-4">
        <input
          type="email"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="הוסף אימייל..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          dir="ltr"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded-lg transition-colors"
        >
          <Plus size={15} />
          הוסף
        </button>
      </div>
      {emails.length === 0 ? (
        <p className="text-sm text-gray-400">אין משתמשים ברשימה</p>
      ) : (
        <ul className="space-y-2">
          {emails.map((email) => (
            <li key={email} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm text-gray-700 font-mono">{email}</span>
              <button onClick={() => onRemove(email)} className="text-gray-300 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SharingControls({ rules, onSave }: Props) {
  const [publicCanView, setPublicCanView] = useState(rules.publicCanView);
  const [admins, setAdmins] = useState<string[]>(rules.admins);
  const [viewers, setViewers] = useState<string[]>(rules.viewers);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setPublicCanView(rules.publicCanView);
    setAdmins(rules.admins);
    setViewers(rules.viewers);
    setDirty(false);
  }, [rules]);

  function mark<T>(setter: React.Dispatch<React.SetStateAction<T>>, value: T) {
    setter(value);
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ publicCanView, admins, viewers });
    setSaving(false);
    setDirty(false);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-1">גישה ציבורית</h3>
        <p className="text-xs text-gray-400 mb-4">אפשר לכל משתמש מחובר לצפות באירוע זה</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => mark(setPublicCanView, !publicCanView)}
            className={`relative w-11 h-6 rounded-full transition-colors ${publicCanView ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${publicCanView ? 'right-1' : 'left-1'}`} />
          </div>
          <span className="text-sm text-gray-700">
            {publicCanView ? 'כולם יכולים לצפות' : 'פרטי — רק משתמשים ברשימה'}
          </span>
        </label>
      </div>

      <EmailList
        label="מנהלים"
        description="יכולים לערוך אורחים, תקציב, וכן לשנות הגדרות שיתוף"
        emails={admins}
        onAdd={(email) => mark(setAdmins, [...admins, email])}
        onRemove={(email) => mark(setAdmins, admins.filter((e) => e !== email))}
      />

      <EmailList
        label="צופים"
        description="יכולים לצפות בנתונים אך לא לערוך"
        emails={viewers}
        onAdd={(email) => mark(setViewers, [...viewers, email])}
        onRemove={(email) => mark(setViewers, viewers.filter((e) => e !== email))}
      />

      {dirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          <Save size={15} />
          {saving ? 'שומר...' : 'שמור הגדרות שיתוף'}
        </button>
      )}
    </div>
  );
}
