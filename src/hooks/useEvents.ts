import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import type { EventDoc, SharingRules } from '../types';

export function useEvents(uid: string | undefined) {
  const [events, setEvents] = useState<EventDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(collection(db, 'events'), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as EventDoc));
      setEvents(docs);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  async function createEvent(title: string, description: string, location: string) {
    const email = auth.currentUser?.email ?? '';
    await addDoc(collection(db, 'events'), {
      title,
      description,
      location,
      createdByUid: uid,
      sharingRules: { publicCanView: false, admins: [email], viewers: [] },
      createdAt: serverTimestamp(),
    });
  }

  async function updateSharingRules(eventId: string, rules: SharingRules) {
    await updateDoc(doc(db, 'events', eventId), { sharingRules: rules });
  }

  async function deleteEvent(eventId: string) {
    await deleteDoc(doc(db, 'events', eventId));
  }

  return { events, loading, createEvent, updateSharingRules, deleteEvent };
}
