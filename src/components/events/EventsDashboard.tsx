import { useState } from 'react';
import { Plus, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEvents } from '../../hooks/useEvents';
import { resolveRole } from '../../utils/rbac';
import EventCard from './EventCard';
import CreateEventModal from './CreateEventModal';
import type { EventDoc } from '../../types';

interface Props {
  onSelectEvent: (event: EventDoc) => void;
}

export default function EventsDashboard({ onSelectEvent }: Props) {
  const { user, signOutUser } = useAuth();
  const { events, loading, createEvent, deleteEvent } = useEvents(user?.uid);
  const [showCreate, setShowCreate] = useState(false);

  const visibleEvents = events.filter((e) => {
    const role = resolveRole(user, e.sharingRules, e.createdByUid);
    return role !== 'no-access';
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <h1 className="text-xl font-bold text-gray-800">מתכנן האירועים</h1>
            <p className="text-xs text-gray-400">{user?.displayName || user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} />
            אירוע חדש
          </button>
          <button
            onClick={signOutUser}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm"
          >
            <LogOut size={16} />
            יציאה
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-700 mb-6">האירועים שלי</h2>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg">אין אירועים עדיין</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 text-indigo-600 hover:underline text-sm"
            >
              צור את האירוע הראשון שלך
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleEvents.map((event) => {
              const role = resolveRole(user, event.sharingRules, event.createdByUid);
              return (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => onSelectEvent(event)}
                  onDelete={() => deleteEvent(event.id)}
                  isAdmin={role === 'admin'}
                />
              );
            })}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateEventModal
          onClose={() => setShowCreate(false)}
          onCreate={createEvent}
        />
      )}
    </div>
  );
}
