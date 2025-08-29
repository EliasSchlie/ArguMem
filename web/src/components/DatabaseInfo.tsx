import { useState, useEffect } from 'react';
import axios from 'axios';

interface DatabaseStats {
  total_sources: number;
  total_quotations: number;
  total_propositions: number;
  total_arguments: number;
}

interface DatabaseInfoProps {
  onNavigateToView?: (view: 'sources' | 'quotations') => void;
}

const DatabaseInfo: React.FC<DatabaseInfoProps> = ({ onNavigateToView }) => {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const response = await axios.get<DatabaseStats>(
        'http://localhost:8000/database/info'
      );
      setStats(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch database stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading">Loading database statistics...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!stats) {
    return null;
  }

  const handleStatClick = (type: 'sources' | 'quotations') => {
    if (onNavigateToView) {
      onNavigateToView(type);
    }
  };

  return (
    <div className="stats-grid mt-3">
      <div
        className="stat-card"
        style={{
          cursor:
            onNavigateToView && stats.total_sources > 0 ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          opacity: stats.total_sources === 0 ? 0.6 : 1,
        }}
        onClick={() => stats.total_sources > 0 && handleStatClick('sources')}
        onMouseEnter={(e) => {
          if (onNavigateToView && stats.total_sources > 0) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow =
              '0 4px 12px rgba(37, 99, 235, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (onNavigateToView && stats.total_sources > 0) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '';
          }
        }}
      >
        <span className="stat-number">{stats.total_sources}</span>
        <div className="stat-label">
          Sources {onNavigateToView && stats.total_sources > 0 && '→'}
        </div>
      </div>
      <div
        className="stat-card"
        style={{
          cursor:
            onNavigateToView && stats.total_quotations > 0
              ? 'pointer'
              : 'default',
          transition: 'all 0.2s ease',
          opacity: stats.total_quotations === 0 ? 0.6 : 1,
        }}
        onClick={() =>
          stats.total_quotations > 0 && handleStatClick('quotations')
        }
        onMouseEnter={(e) => {
          if (onNavigateToView && stats.total_quotations > 0) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow =
              '0 4px 12px rgba(37, 99, 235, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (onNavigateToView && stats.total_quotations > 0) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '';
          }
        }}
      >
        <span className="stat-number">{stats.total_quotations}</span>
        <div className="stat-label">
          Quotations {onNavigateToView && stats.total_quotations > 0 && '→'}
        </div>
      </div>
      <div
        className="stat-card"
        style={{
          cursor:
            onNavigateToView && stats.total_propositions > 0
              ? 'pointer'
              : 'default',
          transition: 'all 0.2s ease',
          opacity: stats.total_propositions === 0 ? 0.6 : 1,
        }}
        onClick={() =>
          stats.total_propositions > 0 && handleStatClick('quotations')
        }
        onMouseEnter={(e) => {
          if (onNavigateToView && stats.total_propositions > 0) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow =
              '0 4px 12px rgba(37, 99, 235, 0.2)';
          }
        }}
        onMouseLeave={(e) => {
          if (onNavigateToView && stats.total_propositions > 0) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '';
          }
        }}
      >
        <span className="stat-number">{stats.total_propositions}</span>
        <div className="stat-label">
          Propositions {onNavigateToView && stats.total_propositions > 0 && '→'}
        </div>
      </div>
      <div
        className="stat-card"
        style={{ opacity: stats.total_arguments === 0 ? 0.6 : 1 }}
      >
        <span className="stat-number">{stats.total_arguments}</span>
        <div className="stat-label">Arguments</div>
      </div>
    </div>
  );
};

export default DatabaseInfo;
