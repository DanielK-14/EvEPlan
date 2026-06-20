import { useState } from 'react';
import { Trash2, ChevronDown, Link2, Pencil } from 'lucide-react';
import type { Guest, GuestStatus, GuestRelation } from '../../types';
import type { GroupColor } from '../../utils/groupColors';

interface Props {
  guest: Guest;
  editable: boolean;
  onUpdate: (patch: Partial<Guest>) => void;
  onDelete: () => void;
  onEdit: () => void;
  onLinkClick: () => void;
  groupColor?: GroupColor;
  groupSize?: number;
}

const STATUS_CYCLE: GuestStatus[] = ['Pending', 'Arrived', 'Not Arrived'];

const STATUS_LABEL: Record<GuestStatus, string> = {
  Pending: 'ממתין',
  Arrived: 'הגיע',
  'Not Arrived': 'לא הגיע',
};

const STATUS_STYLE: Record<GuestStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Arrived: 'bg-green-100 text-green-700',
  'Not Arrived': 'bg-red-100 text-red-700',
};

const RELATION_OPTIONS: GuestRelation[] = ['דניאל', 'בר', 'הורים דניאל', 'הורים בר'];

export default function GuestRow({ guest, editable, onUpdate, onDelete, onEdit, onLinkClick, groupColor, groupSize }: Props) {
  const [editingGift, setEditingGift] = useState(false);
  const [giftInput, setGiftInput] = useState(String(guest.giftAmount ?? 0));

  function cycleStatus() {
    if (!editable) return;
    const idx = STATUS_CYCLE.indexOf(guest.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    onUpdate({ status: next });
  }

  function commitGift() {
    const val = parseFloat(giftInput) || 0;
    onUpdate({ giftAmount: val });
    setEditingGift(false);
  }

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {groupColor ? (
            <div
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: groupColor.dot }}
              title={`קבוצת קשרים • ${groupSize} אורחים`}
            />
          ) : (
            <div className="w-2.5 h-2.5 shrink-0" />
          )}
          <span className="text-sm text-gray-800 font-medium">
            {guest.firstName} {guest.lastName}
          </span>
          {editable && (
            <button
              onClick={onLinkClick}
              title="ניהול קשרים"
              className={`shrink-0 transition-colors opacity-0 group-hover:opacity-100 ${
                groupColor ? 'text-indigo-500 hover:text-indigo-700' : 'text-gray-400 hover:text-indigo-500'
              }`}
            >
              <Link2 size={13} />
            </button>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        {editable ? (
          <div className="relative">
            <select
              value={guest.relatedTo}
              onChange={(e) => onUpdate({ relatedTo: e.target.value as GuestRelation })}
              className="text-xs border rounded px-2 py-1 pr-5 appearance-none bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {RELATION_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown size={10} className="absolute left-1 top-2.5 text-gray-400 pointer-events-none" />
          </div>
        ) : (
          <span className="text-xs text-gray-600">{guest.relatedTo}</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600" dir="ltr">{guest.phoneNumber}</td>
      <td className="px-4 py-3 text-xs text-gray-500">{guest.tableLabel}</td>
      <td className="px-4 py-3">
        <div className="flex gap-1 flex-wrap">
          {guest.isVegan && (
            <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">🥗 טבעוני</span>
          )}
          {guest.hasKids && (
            <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
              👶 {guest.kidsCount}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={cycleStatus}
          disabled={!editable}
          className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${STATUS_STYLE[guest.status]} ${editable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
        >
          {STATUS_LABEL[guest.status]}
        </button>
      </td>
      <td className="px-4 py-3">
        {editable && editingGift ? (
          <input
            type="number"
            value={giftInput}
            onChange={(e) => setGiftInput(e.target.value)}
            onBlur={commitGift}
            onKeyDown={(e) => e.key === 'Enter' && commitGift()}
            className="w-20 text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            autoFocus
            dir="ltr"
          />
        ) : (
          <button
            onClick={() => editable && setEditingGift(true)}
            className={`text-sm ${guest.giftAmount > 0 ? 'text-green-600 font-medium' : 'text-gray-400'} ${editable ? 'hover:underline cursor-pointer' : 'cursor-default'}`}
          >
            ₪{(guest.giftAmount ?? 0).toLocaleString()}
          </button>
        )}
      </td>
      {editable && (
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="text-gray-300 hover:text-indigo-500 transition-colors"
              title="עריכת אורח"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={onDelete}
              className="text-gray-300 hover:text-red-500 transition-colors"
              title="מחיקת אורח"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
