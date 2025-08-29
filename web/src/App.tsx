import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import MemoryForm from './components/MemoryForm';
import DatabaseInfo from './components/DatabaseInfo';
import SourcesList from './components/SourcesList';
import QuotationsList from './components/QuotationsList';
import SourceDetailView from './components/SourceDetailView';
import QuotationDetailView from './components/QuotationDetailView';
import RecentItems from './components/RecentItems';
import ApiKeyModal from './components/ApiKeyModal';

type ViewType =
  | 'add'
  | 'sources'
  | 'quotations'
  | 'recent'
  | 'source-detail'
  | 'quotation-detail';

interface ViewState {
  type: ViewType;
  sourceId?: number;
  quotationId?: number;
}

function App() {
  const [viewState, setViewState] = useState<ViewState>({ type: 'add' });
  const [refreshKey, setRefreshKey] = useState(0);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [databaseStats, setDatabaseStats] = useState<{
    total_sources: number;
    total_quotations: number;
    total_propositions: number;
    total_arguments: number;
  } | null>(null);

  // Fetch database stats
  const fetchDatabaseStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/database/info');
      setDatabaseStats(response.data);
    } catch (error) {
      console.error('Failed to fetch database stats:', error);
    }
  };

  // Clear database function
  const clearDatabase = async () => {
    setIsClearing(true);
    try {
      await axios.delete('http://localhost:8000/database');
      await fetchDatabaseStats();
      setShowClearConfirm(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      console.error('Failed to clear database:', error);
    } finally {
      setIsClearing(false);
    }
  };

  useEffect(() => {
    // Check for saved API key on startup
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowApiKeyModal(true);
    }

    // Fetch initial database stats
    fetchDatabaseStats();
  }, []);

  // Update stats when refreshKey changes
  useEffect(() => {
    fetchDatabaseStats();
  }, [refreshKey]);

  const handleMemoryAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleApiKeySaved = (key: string) => {
    setApiKey(key);
    setShowApiKeyModal(false);
  };

  const openApiKeyModal = () => {
    setShowApiKeyModal(true);
  };

  // Navigation functions
  const navigateToView = (type: ViewType) => {
    setViewState({ type });
  };

  const navigateToSource = (sourceId: number) => {
    setViewState({ type: 'source-detail', sourceId });
  };

  const navigateToQuotation = (quotationId: number) => {
    setViewState({ type: 'quotation-detail', quotationId });
  };

  const navigateBack = () => {
    if (viewState.type === 'source-detail') {
      setViewState({ type: 'sources' });
    } else if (viewState.type === 'quotation-detail') {
      setViewState({ type: 'quotations' });
    }
  };

  const getViewTitle = (viewState: ViewState) => {
    switch (viewState.type) {
      case 'add':
        return {
          title: 'Add Memory',
          subtitle: 'Process and store new argumentative content',
        };
      case 'sources':
        return {
          title: 'Sources',
          subtitle: 'View and manage your stored sources',
        };
      case 'quotations':
        return {
          title: 'Quotations',
          subtitle: 'Browse extracted quotations from your sources',
        };
      case 'recent':
        return {
          title: 'Recent Activity',
          subtitle: 'View recently added sources, quotations, and propositions',
        };
      case 'source-detail':
        return {
          title: `Source #${viewState.sourceId}`,
          subtitle: 'View source details and related quotations',
        };
      case 'quotation-detail':
        return {
          title: `Quotation #${viewState.quotationId}`,
          subtitle: 'View quotation details, source, and propositions',
        };
      default:
        return { title: 'ArguMem', subtitle: '' };
    }
  };

  const currentViewInfo = getViewTitle(viewState);

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>ArguMem</h1>
          <p>Argumentative Memory System</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${viewState.type === 'add' ? 'active' : ''}`}
            onClick={() => navigateToView('add')}
          >
            <span className="nav-item-icon">✍️</span>
            Add Memory
          </button>
          <button
            className={`nav-item ${
              viewState.type === 'recent' ? 'active' : ''
            }`}
            onClick={() => navigateToView('recent')}
          >
            <span className="nav-item-icon">🕒</span>
            Recent
          </button>
          <button
            className={`nav-item ${
              viewState.type === 'sources' || viewState.type === 'source-detail'
                ? 'active'
                : ''
            }`}
            onClick={() => navigateToView('sources')}
          >
            <span className="nav-item-icon">📚</span>
            Sources
          </button>
          <button
            className={`nav-item ${
              viewState.type === 'quotations' ||
              viewState.type === 'quotation-detail'
                ? 'active'
                : ''
            }`}
            onClick={() => navigateToView('quotations')}
          >
            <span className="nav-item-icon">💬</span>
            Quotations
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            onClick={openApiKeyModal}
            className="api-key-btn"
            title="Configure OpenAI API Key"
          >
            🔑 API Key Configuration
          </button>

          {databaseStats &&
            databaseStats.total_sources +
              databaseStats.total_quotations +
              databaseStats.total_propositions +
              databaseStats.total_arguments >
              0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={isClearing}
                className="clear-database-btn"
                title="Clear all data from database"
                style={{
                  backgroundColor: 'var(--error)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: isClearing ? 'not-allowed' : 'pointer',
                  fontSize: '0.9rem',
                  opacity: isClearing ? 0.6 : 1,
                  marginTop: '0.5rem',
                  width: '100%',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isClearing) {
                    e.currentTarget.style.backgroundColor = '#dc3545';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isClearing) {
                    e.currentTarget.style.backgroundColor = 'var(--error)';
                  }
                }}
              >
                {isClearing ? '🗑️ Clearing...' : '🗑️ Clear All Data'}
              </button>
            )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <h2>{currentViewInfo.title}</h2>
          {currentViewInfo.subtitle && <p>{currentViewInfo.subtitle}</p>}
          <DatabaseInfo
            key={refreshKey}
            onNavigateToView={(view) => navigateToView(view)}
          />
        </header>

        <div className="content-body">
          {viewState.type === 'add' && (
            <MemoryForm
              onMemoryAdded={handleMemoryAdded}
              apiKey={apiKey}
              onNavigateToSource={navigateToSource}
            />
          )}
          {viewState.type === 'recent' && (
            <RecentItems
              key={refreshKey}
              onNavigateToSource={navigateToSource}
              onNavigateToQuotation={navigateToQuotation}
            />
          )}
          {viewState.type === 'sources' && (
            <SourcesList
              key={refreshKey}
              onNavigateToSource={navigateToSource}
            />
          )}
          {viewState.type === 'quotations' && (
            <QuotationsList
              key={refreshKey}
              onNavigateToQuotation={navigateToQuotation}
              onNavigateToSource={navigateToSource}
            />
          )}
          {viewState.type === 'source-detail' && viewState.sourceId && (
            <SourceDetailView
              sourceId={viewState.sourceId}
              onNavigateToQuotation={navigateToQuotation}
              onBack={navigateBack}
            />
          )}
          {viewState.type === 'quotation-detail' && viewState.quotationId && (
            <QuotationDetailView
              quotationId={viewState.quotationId}
              onNavigateToSource={navigateToSource}
              onBack={navigateBack}
            />
          )}
        </div>
      </main>

      <ApiKeyModal isOpen={showApiKeyModal} onSave={handleApiKeySaved} />

      {/* Clear Database Confirmation Dialog */}
      {showClearConfirm && databaseStats && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--surface)',
              padding: '2rem',
              borderRadius: '1rem',
              maxWidth: '400px',
              margin: '1rem',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--error)' }}>
                Clear All Data?
              </h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                This will permanently delete all sources, quotations,
                propositions, and arguments from the database. This action
                cannot be undone.
              </p>
            </div>

            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <strong>Current data:</strong>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem',
                }}
              >
                {databaseStats.total_sources} sources •{' '}
                {databaseStats.total_quotations} quotations •{' '}
                {databaseStats.total_propositions} propositions •{' '}
                {databaseStats.total_arguments} arguments
              </div>
            </div>

            <div
              style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}
            >
              <button
                onClick={() => setShowClearConfirm(false)}
                disabled={isClearing}
                style={{
                  backgroundColor: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={clearDatabase}
                disabled={isClearing}
                style={{
                  backgroundColor: 'var(--error)',
                  border: 'none',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  opacity: isClearing ? 0.6 : 1,
                }}
              >
                {isClearing ? 'Clearing...' : 'Yes, Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
