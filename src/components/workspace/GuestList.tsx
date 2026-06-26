import { useState, useMemo } from 'react';
import { UserPlus, Search, Users } from 'lucide-react';
import type { Guest, GuestStatus, GuestRelation } from '../../types';
import { buildGroupColorMap } from '../../utils/groupColors';
import GuestRow from './GuestRow';
import AddGuestModal from './AddGuestModal';
import GuestEditModal from './GuestEditModal';
import LinkGuestsModal from './LinkGuestsModal';

interface Props {
  guests: Guest[];
  editable: boolean;
  onAdd: (guest: Omit<Guest, 'id'>) => Promise<void>;
  onUpdate: (id: string, patch: Partial<Guest>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const RELATION_OPTIONS: GuestRelation[] = ['דניאל', 'בר', 'הורים דניאל', 'הורים בר'];
const STATUS_OPTIONS: GuestStatus[] = ['Pending', 'Arrived', 'Not Arrived'];
const STATUS_LABEL: Record<GuestStatus, string> = {
  Pending: 'ממתין', Arrived: 'הגיע', 'Not Arrived': 'לא הגיע',
};

export default function GuestList({ guests, editable, onAdd, onUpdate, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [linkingGuest, setLinkingGuest] = useState<Guest | null>(null);
  const existingLabels = [...new Set(guests.map((g) => g.tableLabel).filter(Boolean))];
  const [search, setSearch] = useState('');
  const [filterRelation, setFilterRelation] = useState<GuestRelation | ''>('');
  const [filterStatus, setFilterStatus] = useState<GuestStatus | ''>('');
  const [filterGroup, setFilterGroup] = useState<'linked' | 'unlinked' | ''>('');
  const [sortMode, setSortMode] = useState<'alpha' | 'relation'>('alpha');

  const groupColorMap = useMemo(() => buildGroupColorMap(guests), [guests]);

  function getGroupSize(groupId: string | undefined): number {
    if (!groupId) return 0;
    return guests.filter(g => g.relationGroupId === groupId).length;
  }

  async function handleAddWithLinks(guest: Omit<Guest, 'id'>, linkedGuestIds: string[]) {
    if (linkedGuestIds.length === 0) {
      await onAdd(guest);
      return;
    }
    let groupId: string | undefined;
    for (const id of linkedGuestIds) {
      const g = guests.find(gg => gg.id === id);
      if (g?.relationGroupId) { groupId = g.relationGroupId; break; }
    }
    if (!groupId) groupId = crypto.randomUUID();
    await onAdd({ ...guest, relationGroupId: groupId });
    const allToUpdate = new Set(linkedGuestIds);
    for (const id of linkedGuestIds) {
      const g = guests.find(gg => gg.id === id);
      if (g?.relationGroupId) {
        guests.filter(gg => gg.relationGroupId === g.relationGroupId)
              .forEach(gg => allToUpdate.add(gg.id));
      }
    }
    for (const id of allToUpdate) {
      await onUpdate(id, { relationGroupId: groupId });
    }
  }

  async function handleLinkSave(currentGuest: Guest, selectedIds: string[]) {
    const currentGroupId = currentGuest.relationGroupId;
    const oldGroupPeers = currentGroupId
      ? guests.filter(g => g.relationGroupId === currentGroupId && g.id !== currentGuest.id)
      : [];

    if (selectedIds.length === 0) {
      await onUpdate(currentGuest.id, { relationGroupId: undefined });
      if (oldGroupPeers.length === 1) {
        await onUpdate(oldGroupPeers[0].id, { relationGroupId: undefined });
      }
      return;
    }

    let groupId = currentGroupId;
    if (!groupId) {
      for (const id of selectedIds) {
        const g = guests.find(gg => gg.id === id);
        if (g?.relationGroupId) { groupId = g.relationGroupId; break; }
      }
      if (!groupId) groupId = crypto.randomUUID();
    }

    const futureGroupIds = new Set([currentGuest.id, ...selectedIds]);

    for (const peer of oldGroupPeers) {
      if (!futureGroupIds.has(peer.id)) {
        await onUpdate(peer.id, { relationGroupId: undefined });
      }
    }

    for (const id of [...futureGroupIds]) {
      const g = guests.find(gg => gg.id === id);
      if (!g) continue;
      if (g.relationGroupId && g.relationGroupId !== groupId) {
        const oldGroupSiblings = guests.filter(
          gg => gg.relationGroupId === g.relationGroupId && !futureGroupIds.has(gg.id)
        );
        for (const sibling of oldGroupSiblings) {
          await onUpdate(sibling.id, { relationGroupId: groupId });
        }
      }
      await onUpdate(id, { relationGroupId: groupId });
    }
  }

  const sorted = useMemo(() => {
    const alpha = (a: Guest, b: Guest) => {
      const lastCmp = (a.lastName || '').localeCompare(b.lastName || '', 'he');
      if (lastCmp !== 0) return lastCmp;
      return (a.firstName || '').localeCompare(b.firstName || '', 'he');
    };

    if (sortMode === 'relation') {
      // Compute the alphabetically-first key per group to order groups themselves
      const groupKey = new Map<string, string>();
      for (const g of guests) {
        if (!g.relationGroupId) continue;
        const key = (g.lastName || '') + (g.firstName || '');
        const existing = groupKey.get(g.relationGroupId);
        if (!existing || key.localeCompare(existing, 'he') < 0) {
          groupKey.set(g.relationGroupId, key);
        }
      }
      return [...guests].sort((a, b) => {
        const aGrouped = !!a.relationGroupId;
        const bGrouped = !!b.relationGroupId;
        if (aGrouped !== bGrouped) return aGrouped ? -1 : 1; // ungrouped go last
        if (!aGrouped) return alpha(a, b);
        if (a.relationGroupId !== b.relationGroupId) {
          return (groupKey.get(a.relationGroupId!) || '').localeCompare(groupKey.get(b.relationGroupId!) || '', 'he');
        }
        return alpha(a, b);
      });
    }

    return [...guests].sort(alpha);
  }, [guests, sortMode]);

  const filtered = sorted.filter((g) => {
    const name = `${g.firstName} ${g.lastName}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || g.tableLabel.toLowerCase().includes(search.toLowerCase()) || g.phoneNumber.includes(search);
    const matchRelation = !filterRelation || g.relatedTo === filterRelation;
    const matchStatus = !filterStatus || g.status === filterStatus;
    const matchGroup = !filterGroup || (filterGroup === 'linked' ? !!g.relationGroupId : !g.relationGroupId);
    return matchSearch && matchRelation && matchStatus && matchGroup;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 flex-1">
          <div className="relative">
            <Search size={14} className="absolute right-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="חיפוש..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg pr-9 pl-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <select
            value={filterRelation}
            onChange={(e) => setFilterRelation(e.target.value as GuestRelation | '')}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">כל הקשרים</option>
            {RELATION_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as GuestStatus | '')}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">כל הסטטוסים</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value as 'linked' | 'unlinked' | '')}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">כל הקישורים</option>
            <option value="linked">יש קישור</option>
            <option value="unlinked">אין קישור</option>
          </select>
          <button
            onClick={() => setSortMode(m => m === 'alpha' ? 'relation' : 'alpha')}
            title={sortMode === 'alpha' ? 'מיין לפי קשר' : 'מיין אלפביתי'}
            className={`flex items-center gap-1.5 border rounded-lg px-3 py-2 text-sm transition-colors ${
              sortMode === 'relation'
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700 font-medium'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Users size={14} />
            {sortMode === 'relation' ? 'לפי קשר' : 'לפי קשר'}
          </button>
        </div>
        {editable && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <UserPlus size={15} />
            הוסף אורח
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">👤</div>
            <p>אין אורחים תואמים</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">שם</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">קשור ל</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">טלפון</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">שולחן</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">פרטים</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">סטטוס</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">מתנה</th>
                  {editable && <th className="px-4 py-3" />}
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <GuestRow
                    key={g.id}
                    guest={g}
                    editable={editable}
                    onUpdate={(patch) => onUpdate(g.id, patch)}
                    onDelete={() => onDelete(g.id)}
                    onEdit={() => setEditingGuest(g)}
                    onLinkClick={() => setLinkingGuest(g)}
                    groupColor={g.relationGroupId ? groupColorMap.get(g.relationGroupId) : undefined}
                    groupSize={getGroupSize(g.relationGroupId)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 mt-2 text-left">
        {filtered.length} מתוך {guests.length} אורחים
      </p>

      {showAdd && (
        <AddGuestModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAddWithLinks}
          existingLabels={existingLabels}
          allGuests={guests}
        />
      )}

      {editingGuest && (
        <GuestEditModal
          guest={editingGuest}
          existingLabels={existingLabels}
          allGuests={guests}
          onClose={() => setEditingGuest(null)}
          onSave={(patch) => onUpdate(editingGuest.id, patch)}
        />
      )}

      {linkingGuest && (
        <LinkGuestsModal
          guest={linkingGuest}
          allGuests={guests}
          groupColorMap={groupColorMap}
          onClose={() => setLinkingGuest(null)}
          onSave={(selectedIds) => handleLinkSave(linkingGuest, selectedIds)}
        />
      )}
    </div>
  );
}
