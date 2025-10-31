// src/hooks/useSRSStats.js
import { useEffect, useState } from 'react';
import { ottieniStatistiche } from '../services/flashcardService';

export function useSRSStats(idUtente) {
  const [stats, setStats] = useState(null);
  const [errore, setErrore] = useState(null);
  const [caricamento, setCaricamento] = useState(false);

  useEffect(() => {
    if (!idUtente) {
      setStats(null);
      return;
    }

    let attivo = true;
    setCaricamento(true);
    setErrore(null);

    ottieniStatistiche(idUtente)
      .then((result) => {
        if (!attivo) return;
        if (result && result.successo) {
          setStats(result.dati);
        } else {
          setErrore(result?.errore || 'Errore sconosciuto nel calcolo statistiche');
        }
      })
      .catch((e) => {
        if (!attivo) return;
        setErrore(e?.message || 'Errore nel recupero statistiche');
      })
      .finally(() => {
        if (!attivo) return;
        setCaricamento(false);
      });

    return () => {
      attivo = false;
    };
  }, [idUtente]);

  return { stats, errore, caricamento };
}