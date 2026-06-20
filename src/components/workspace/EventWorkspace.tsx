import { useState } from 'react';
import { ArrowRight, MapPin, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGuests } from '../../hooks/useGuests';
import { useFinanceConfig } from '../../hooks/useFinanceConfig';
import { useEvents } from '../../hooks/useEvents';
import { resolveRole, canEdit, isAdmin } from '../../utils/rbac';
import KPIGrid from './KPIGrid';
import GuestList from './GuestList';
import FinanceConfig from './FinanceConfig';
import SharingControls from './SharingControls';
import type { EventDoc } from '../../types';

type Tab = 'guests' | 'finance' | 'sharing';

interface Props {
  event: EventDoc;
  onBack: () => void;
}

export default function EventWorkspace({ event, onBack }: Props) {
  const { user } = useAuth();
  const { guests, loading: guestsLoading, addGuest, updateGuest, removeGuest } = useGuests(event.id);
  const { config, loading: configLoading, saveConfig } = useFinanceConfig(event.id);
  const { updateSharingRules } = useEvents(user?.uid);
  const [activeTab, setActiveTab] = useState<Tab>('guests');

  const role = resolveRole(user, event.sharingRules, event.createdByUid);
  const editable = canEdit(role);
  const adminUser = isAdmin(role);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'guests', label: 'רשימת אורחים' },
    { key: 'finance', label: 'תקציב וספקים' },
    ...(adminUser ? [{ key: 'sharing' as Tab, label: 'הגדרות שיתוף' }] : []),
  ];

  if (role === 'no-access') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <p className="text-gray-600">אין לך גישה לאירוע זה</p>
          <button onClick={onBack} className="mt-4 text-indigo-600 hover:underline text-sm">
            חזור לאירועים
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm mb-3 transition-colors"
        >
          <ArrowRight size={16} />
          חזרה לכל האירועים
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
          {event.description && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
              <FileText size={13} />
              <span>{event.description}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-0.5">
              <MapPin size={13} />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {!guestsLoading && !configLoading && (
          <KPIGrid guests={guests} config={config} />
        )}

        <div>
          <div className="flex gap-1 mb-6 border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'guests' && (
            <GuestList
              guests={guests}
              editable={editable}
              onAdd={addGuest}
              onUpdate={updateGuest}
              onDelete={removeGuest}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceConfig config={config} editable={editable} onSave={saveConfig} />
          )}

          {activeTab === 'sharing' && adminUser && (
            <SharingControls
              rules={event.sharingRules}
              onSave={(rules) => updateSharingRules(event.id, rules)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
