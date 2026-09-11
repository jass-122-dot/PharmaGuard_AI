import React from 'react';

export function Header({ status = 'Pending Triage', activeTab, onTabChange, groqApiKey, onApiKeyChange }) {
  const getBadgeStyle = (st) => {
    switch (st) {
      case 'Triaged':
        return { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };
      case 'Saved':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      default:
        return { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' };
    }
  };

  const badge = getBadgeStyle(status);

  return (
    <header className="qms-header">
      <div className="header-top">
        <div>
          <div className="title-row">
            <h1 className="header-title">Log Customer Complaint</h1>
            <span 
              className="status-badge" 
              style={{ backgroundColor: badge.bg, color: badge.text, borderColor: badge.border }}
            >
              {status}
            </span>
          </div>
          <p className="header-subtitle">API & FDF Quality Assurance Module</p>
        </div>

        {/* Navigation & Settings */}
        <div className="header-actions">
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'intake' ? 'active' : ''}`}
              onClick={() => onTabChange('intake')}
            >
              📋 Log Complaint Form
            </button>
            <button 
              className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => onTabChange('dashboard')}
            >
              📊 Quality Risk Dashboard
            </button>
          </div>

          {/* Groq API Key Config Toggle */}
          <div className="groq-key-input-wrap">
            <span className="groq-pill">Groq LLM</span>
            <input
              type="password"
              className="groq-key-field"
              placeholder="Paste Groq Key (gemma2-9b-it)"
              value={groqApiKey || ''}
              onChange={(e) => onApiKeyChange(e.target.value)}
              title="Groq API Key (Optional - Fallback parser active if blank)"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
