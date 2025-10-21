// src/hooks/useSRSStats.js
export function useSRSStats(idUtente) {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    ottieniStatistiche(idUtente).then(result => {
      if (result.successo) setStats(result.dati);
    });
  }, [idUtente]);
  
  return stats;
}