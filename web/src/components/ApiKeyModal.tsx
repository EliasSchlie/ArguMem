import { useState, useEffect } from 'react';
import './ApiKeyModal.css';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim());
      onSave(apiKey.trim());
    }
  };

  const handleClear = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>OpenAI API Key Required</h2>
        <p>
          ArguMem needs your OpenAI API key to process and extract quotations
          from your memories. Your key is stored locally in your browser and
          never sent to any server except OpenAI.
        </p>

        <div className="form-group">
          <label htmlFor="apiKey">OpenAI API Key</label>
          <div className="api-key-input-group">
            <input
              type={showKey ? 'text' : 'password'}
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="api-key-input"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="toggle-visibility-btn"
            >
              {showKey ? '👁️' : '🙈'}
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={handleClear}
            className="btn btn-secondary"
            type="button"
          >
            Clear Saved Key
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={!apiKey.trim()}
          >
            Save & Continue
          </button>
        </div>

        <div className="api-key-help">
          <small>
            <strong>Need an API key?</strong> Get one at{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
            >
              platform.openai.com/api-keys
            </a>
          </small>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
