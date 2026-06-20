import { useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { FinanceConfig } from '../types';

const DEFAULT_CONFIG: FinanceConfig = { dishPrice: 0, attractions: [] };

export function useFinanceConfig(eventId: string | null) {
  const [config, setConfig] = useState<FinanceConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    const unsub = onSnapshot(doc(db, 'events', eventId, 'financeConfig', 'settings'), (snap) => {
      if (snap.exists()) {
        setConfig(snap.data() as FinanceConfig);
      } else {
        setConfig(DEFAULT_CONFIG);
      }
      setLoading(false);
    });
    return unsub;
  }, [eventId]);

  async function saveConfig(updated: FinanceConfig) {
    if (!eventId) return;
    await setDoc(doc(db, 'events', eventId, 'financeConfig', 'settings'), updated);
  }

  return { config, loading, saveConfig };
}
