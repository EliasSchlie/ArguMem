import { useState, useEffect } from 'react';

interface DatabaseStats {
  total_sources: number;
  total_quotations: number;
  total_propositions: number;
  total_arguments: number;
}

export function DatabaseInfo() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/database/info');
      if (!response.ok) {
        throw new Error('Failed to fetch database info');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading database info...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return null;

  return (
    <div className="database-info">
      <h3>📊 Database Overview</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{stats.total_sources}</div>
          <div className="stat-label">Sources</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.total_quotations}</div>
          <div className="stat-label">Quotations</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.total_propositions}</div>
          <div className="stat-label">Propositions</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{stats.total_arguments}</div>
          <div className="stat-label">Arguments</div>
        </div>
      </div>
    </div>
  );
}
