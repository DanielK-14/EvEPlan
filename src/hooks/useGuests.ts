import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, deleteField,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Guest } from '../types';

export function useGuests(eventId: string | null) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    const unsub = onSnapshot(collection(db, 'events', eventId, 'guests'), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Guest));
      setGuests(docs);
      setLoading(false);
    });
    return unsub;
  }, [eventId]);

  async function addGuest(guest: Omit<Guest, 'id'>) {
    if (!eventId) return;
    await addDoc(collection(db, 'events', eventId, 'guests'), guest);
  }

  async function updateGuest(guestId: string, patch: Partial<Guest>) {
    if (!eventId) return;
    const firestorePatch = Object.fromEntries(
      Object.entries(patch as Record<string, unknown>).map(([k, v]) => [k, v === undefined ? deleteField() : v])
    );
    await updateDoc(doc(db, 'events', eventId, 'guests', guestId), firestorePatch as never);
  }

  async function removeGuest(guestId: string) {
    if (!eventId) return;
    await deleteDoc(doc(db, 'events', eventId, 'guests', guestId));
  }

  return { guests, loading, addGuest, updateGuest, removeGuest };
}
