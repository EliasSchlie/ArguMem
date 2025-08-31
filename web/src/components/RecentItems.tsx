import { useState, useEffect } from 'react';
import axios from 'axios';

interface RecentItem {
  id: number;
  title: string | null;
  created_at: string;
  last_edited: string;
}

interface RecentItemsProps {
  onNavigateToSource: (sourceId: number) => void;
}

const RecentItems: React.FC<RecentItemsProps> = ({ onNavigateToSource }) => {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentItems = async () => {
    try {
      const response = await axios.get<RecentItem[]>(
        'http://localhost:8000/sources/recent'
      );
      setItems(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch recent items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentItems();
  }, []);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const handleItemClick = (item: RecentItem) => {
    onNavigateToSource(item.id);
  };

  if (loading) {
    return <div className="loading">Loading recent items...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="card text-center">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
        <h3 style={{ marginBottom: '0.5rem' }}>No Recent Activity</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Start adding memories to see your recent activity here!
        </p>
      </div>
    );
  }

  return (
    <div className="recent-items">
      <div className="items-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className="item-card"
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => handleItemClick(item)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '';
            }}
          >
            <div className="item-title">
              <span style={{ marginRight: '0.5rem' }}>📄</span>
              {item.title || `Source #${item.id}`}
            </div>

            <div className="item-meta">
              <p>Created: {formatDate(item.created_at)}</p>
              <p>Edited: {formatDate(item.last_edited)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentItems;
