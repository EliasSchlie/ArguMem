import { useState, useEffect } from 'react';
import axios from 'axios';

interface RecentItem {
  type: 'source' | 'quotation' | 'proposition';
  id: number;
  timestamp: string;
  title: string | null;
  preview: string;
  content: string;
  context?: string;
  locator?: string | null;
  source_id?: number;
  source_title?: string | null;
  quotation_id?: number;
  quotation_text?: string;
  paraphrase?: string | null;
}

interface RecentItemsProps {
  onNavigateToSource: (sourceId: number) => void;
  onNavigateToQuotation: (quotationId: number) => void;
}

const RecentItems: React.FC<RecentItemsProps> = ({
  onNavigateToSource,
  onNavigateToQuotation,
}) => {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentItems = async () => {
    try {
      const response = await axios.get<RecentItem[]>(
        'http://localhost:8000/recent'
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
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return `Today at ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (diffDays === 2) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'source':
        return '📄';
      case 'quotation':
        return '💬';
      case 'proposition':
        return '🎯';
      default:
        return '📝';
    }
  };

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'source':
        return 'Source';
      case 'quotation':
        return 'Quotation';
      case 'proposition':
        return 'Proposition';
      default:
        return 'Item';
    }
  };

  const handleItemClick = (item: RecentItem) => {
    switch (item.type) {
      case 'source':
        onNavigateToSource(item.id);
        break;
      case 'quotation':
        if (item.source_id) {
          onNavigateToQuotation(item.id);
        }
        break;
      case 'proposition':
        if (item.quotation_id) {
          onNavigateToQuotation(item.quotation_id);
        }
        break;
    }
  };

  const getClickableText = (item: RecentItem) => {
    switch (item.type) {
      case 'source':
        return 'Click to view source details';
      case 'quotation':
        return 'Click to view quotation details';
      case 'proposition':
        return 'Click to view parent quotation';
      default:
        return '';
    }
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
        {items.map((item, index) => (
          <div
            key={`${item.type}-${item.id}-${index}`}
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
              <span style={{ marginRight: '0.5rem' }}>
                {getItemIcon(item.type)}
              </span>
              {item.title || `${getItemTypeLabel(item.type)} #${item.id}`}
              <span
                style={{
                  color: 'var(--primary)',
                  float: 'right',
                  fontSize: '0.9rem',
                }}
              >
                {getClickableText(item)} →
              </span>
            </div>

            <div className="item-meta">
              <span
                style={{
                  backgroundColor:
                    item.type === 'source'
                      ? 'var(--success)'
                      : item.type === 'quotation'
                      ? 'var(--primary)'
                      : 'var(--warning)',
                  color: 'white',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '0.3rem',
                  fontSize: '0.8rem',
                  marginRight: '0.5rem',
                }}
              >
                {getItemTypeLabel(item.type)}
              </span>
              🕒 {formatDate(item.timestamp)}
            </div>

            <div className="item-content">
              {item.type === 'source' && item.context && (
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Context:</strong>
                  <p
                    style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {item.context}
                  </p>
                </div>
              )}

              {item.type === 'quotation' && item.locator && (
                <div
                  style={{
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  📍 {item.locator}
                </div>
              )}

              <div
                style={{
                  background: 'var(--surface-hover)',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  margin: '0.5rem 0',
                  fontSize: '0.925rem',
                  lineHeight: '1.5',
                  fontStyle: item.type === 'quotation' ? 'italic' : 'normal',
                  ...(item.type === 'quotation' && {
                    borderLeft: '4px solid var(--primary)',
                  }),
                }}
              >
                {item.type === 'quotation' && '"'}
                {item.preview}
                {item.preview.length === 200 && '...'}
                {item.type === 'quotation' && '"'}
              </div>

              {item.type === 'quotation' && item.source_title && (
                <div
                  style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}
                >
                  📚 From: {item.source_title}
                </div>
              )}

              {item.type === 'proposition' && item.paraphrase && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Paraphrase:</strong>
                  <p
                    style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.9rem',
                      fontStyle: 'italic',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {item.paraphrase}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentItems;
