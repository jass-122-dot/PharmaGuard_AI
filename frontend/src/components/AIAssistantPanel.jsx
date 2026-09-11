import React, { useState, useRef } from 'react';
import { PasteTextModal } from './PasteTextModal.jsx';

export function AIAssistantPanel({ 
  complaintState, 
  chatState, 
  onFileUpload, 
  onTextSubmit, 
  onSendChatMessage 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChatMessage(chatInput);
    setChatInput('');
  };

  return (
    <div className="ai-assistant-panel">
      {/* PANEL HEADER */}
      <div className="panel-header">
        <div className="panel-title-wrap">
          <span className="sparkle-icon">✦</span>
          <h2 className="panel-title">AI Complaint Intake Assistant</h2>
        </div>
        <span className="beta-badge">BETA</span>
      </div>

      {/* DRAG & DROP UPLOAD BOX */}
      <div 
        className="drop-zone"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,.docx,.txt,.eml"
          onChange={handleFileChange}
        />
        <div className="drop-icon">☁</div>
        <p className="drop-main-text">
          Drag & drop complaint document here
        </p>
        <p className="drop-link-text">
          or <span className="link-span">click to browse</span>
        </p>
      </div>

      {/* OR DIVIDER */}
      <div className="divider-row">
        <span className="divider-line"></span>
        <span className="divider-text">OR</span>
        <span className="divider-line"></span>
      </div>

      {/* PASTE TEXT BUTTON */}
      <button 
        type="button" 
        className="btn btn-paste-text"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="btn-icon">📄</span> Paste Complaint Text / Email
      </button>

      {/* SUPPORTED FORMATS INFO BOX */}
      <div className="info-box">
        <span className="info-icon">ⓘ</span>
        <span>Supported formats: <strong>PDF, DOCX, TXT, EML</strong> | Max file size: 10MB</span>
      </div>

      {/* EXTRACTION PROGRESS SECTION */}
      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">EXTRACTION PROGRESS</span>
          <span className="progress-percent">{complaintState.extractionProgress}%</span>
        </div>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill"
            style={{ width: `${complaintState.extractionProgress}%` }}
          ></div>
        </div>
        <p className="progress-status-text">
          {complaintState.extractionStatusText}
        </p>
      </div>

      {/* AI ASSISTANT DISPLAY CARD */}
      <div className="ai-assistant-card">
        <div className="ai-card-title-row">
          <span className="ai-card-icon">🤖</span>
          <span className="ai-card-title">AI ASSISTANT</span>
        </div>
        
        <div className="chat-messages-scroll">
          {chatState.messages.map((msg, index) => (
            <div 
              key={index} 
              className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'assistant-bubble'}`}
            >
              {msg.content}
            </div>
          ))}
          {chatState.isSending && (
            <div className="chat-bubble assistant-bubble typing-bubble">
              Thinking and analyzing QA guidelines...
            </div>
          )}
        </div>
      </div>

      {/* CHAT INPUT BOX */}
      <form onSubmit={handleChatSubmit} className="chat-input-form">
        <div className="chat-input-wrap">
          <input
            type="text"
            className="chat-input"
            placeholder="Ask me anything about this complaint..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
          />
          <button type="submit" className="chat-send-btn" disabled={!chatInput.trim()}>
            ✈
          </button>
        </div>
      </form>

      {/* FOOTER NOTICE */}
      <p className="ai-footer-notice">
        AI responses may contain errors. Please verify information.
      </p>

      {/* PASTE TEXT MODAL */}
      <PasteTextModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitText={onTextSubmit}
      />
    </div>
  );
}
