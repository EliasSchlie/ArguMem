import { useState, useEffect } from 'react';
import { MemoryForm } from './components/MemoryForm';
import { DatabaseInfo } from './components/DatabaseInfo';
import { SourcesList } from './components/SourcesList';
import { QuotationsList } from './components/QuotationsList';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'add' | 'sources' | 'quotations'>(
    'add'
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMemoryAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🧠 ArguMem</h1>
        <p>Argumentative Memory System for LLMs</p>
      </header>

      <DatabaseInfo key={refreshTrigger} />

      <nav className="tabs">
        <button
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => setActiveTab('add')}
        >
          Add Memory
        </button>
        <button
          className={activeTab === 'sources' ? 'active' : ''}
          onClick={() => setActiveTab('sources')}
        >
          Sources
        </button>
        <button
          className={activeTab === 'quotations' ? 'active' : ''}
          onClick={() => setActiveTab('quotations')}
        >
          Quotations
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'add' && (
          <MemoryForm onMemoryAdded={handleMemoryAdded} />
        )}
        {activeTab === 'sources' && <SourcesList key={refreshTrigger} />}
        {activeTab === 'quotations' && <QuotationsList key={refreshTrigger} />}
      </main>
    </div>
  );
}

export default App;
