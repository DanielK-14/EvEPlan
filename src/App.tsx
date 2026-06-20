import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './components/auth/AuthGuard';
import EventsDashboard from './components/events/EventsDashboard';
import EventWorkspace from './components/workspace/EventWorkspace';
import type { EventDoc } from './types';

function AppContent() {
  const [activeEvent, setActiveEvent] = useState<EventDoc | null>(null);

  if (activeEvent) {
    return (
      <EventWorkspace
        event={activeEvent}
        onBack={() => setActiveEvent(null)}
      />
    );
  }

  return <EventsDashboard onSelectEvent={setActiveEvent} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <AppContent />
      </AuthGuard>
    </AuthProvider>
  );
}
