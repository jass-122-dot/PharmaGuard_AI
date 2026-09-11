import React, { useEffect, useState, useReducer } from 'react';
import { Header } from './components/Header.jsx';
import { ComplaintForm } from './components/ComplaintForm.jsx';
import { AIAssistantPanel } from './components/AIAssistantPanel.jsx';
import { SavedComplaintsDashboard } from './components/SavedComplaintsDashboard.jsx';
import { complaintReducer } from './store/complaintSlice.js';
import { chatReducer } from './store/chatSlice.js';

const API_BASE = window.location.origin.includes('8000') ? '' : 'http://localhost:8080';

export function App() {
  const [complaintState, complaintDispatch] = useReducer(
    complaintReducer, 
    undefined, 
    () => complaintReducer(undefined, { type: '@@INIT' })
  );

  const [chatState, chatDispatch] = useReducer(
    chatReducer, 
    undefined, 
    () => chatReducer(undefined, { type: '@@INIT' })
  );

  // Fetch complaints on load
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/complaints`);
      if (res.ok) {
        const json = await res.json();
        complaintDispatch({ type: 'SET_SAVED_COMPLAINTS', payload: json.complaints || [] });
      }
    } catch (err) {
      console.warn("Could not load complaints from API:", err);
    }
  };

  // 1. File Upload Intake handler
  const handleFileUpload = async (file) => {
    complaintDispatch({ type: 'START_EXTRACTION' });
    
    // Progress animation
    let p = 25;
    const interval = setInterval(() => {
      p += 15;
      if (p < 85) {
        complaintDispatch({
          type: 'UPDATE_EXTRACTION_PROGRESS',
          payload: { progress: p, statusText: 'Analyzing document content and extracting key details...' }
        });
      }
    }, 400);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const headers = {};
      if (complaintState.groqApiKey) {
        headers['x-groq-api-key'] = complaintState.groqApiKey;
      }

      const res = await fetch(`${API_BASE}/api/intake/upload`, {
        method: 'POST',
        headers,
        body: formData
      });

      clearInterval(interval);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      
      complaintDispatch({
        type: 'EXTRACTION_SUCCESS',
        payload: { data: json.data }
      });

      chatDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now(),
          sender: 'assistant',
          role: 'assistant',
          content: `I've extracted the complaint details from "${file.name}"! The form has been populated for your review.\n\nSeverity: ${json.data.initial_severity || 'Major'} | Priority: ${json.data.priority || 'Medium'}`
        }
      });

    } catch (err) {
      clearInterval(interval);
      complaintDispatch({
        type: 'EXTRACTION_FAILURE',
        payload: { error: err.message }
      });
    }
  };

  // 2. Text Intake handler
  const handleTextSubmit = async (text) => {
    complaintDispatch({ type: 'START_EXTRACTION' });

    let p = 30;
    const interval = setInterval(() => {
      p += 20;
      if (p < 90) {
        complaintDispatch({
          type: 'UPDATE_EXTRACTION_PROGRESS',
          payload: { progress: p, statusText: 'Extracting pharmaceutical parameters & risk matrix...' }
        });
      }
    }, 350);

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (complaintState.groqApiKey) {
        headers['x-groq-api-key'] = complaintState.groqApiKey;
      }

      const res = await fetch(`${API_BASE}/api/intake/text`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          text,
          api_key: complaintState.groqApiKey
        })
      });

      clearInterval(interval);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      complaintDispatch({
        type: 'EXTRACTION_SUCCESS',
        payload: { data: json.data }
      });

      chatDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now(),
          sender: 'assistant',
          role: 'assistant',
          content: `Complaint text analyzed successfully!\nExtracted Product: ${json.data.product_name || 'N/A'}\nBatch Number: ${json.data.batch_lot_number || 'N/A'}\nInitial Severity: ${json.data.initial_severity || 'Major'}`
        }
      });

    } catch (err) {
      clearInterval(interval);
      complaintDispatch({
        type: 'EXTRACTION_FAILURE',
        payload: { error: err.message }
      });
    }
  };

  // 3. Interactive Assistant Chat handler
  const handleSendChatMessage = async (msgText) => {
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      role: 'user',
      content: msgText
    };

    chatDispatch({ type: 'ADD_MESSAGE', payload: userMsg });
    chatDispatch({ type: 'SET_SENDING', payload: true });

    try {
      const complaintContext = {
        complaint_source: complaintState.complaintSource,
        customer_name: complaintState.customerName,
        product_name: complaintState.productName,
        product_strength_grade: complaintState.productStrengthGrade,
        batch_lot_number: complaintState.batchLotNumber,
        manufacturing_date: complaintState.manufacturingDate,
        expiry_date: complaintState.expiryDate,
        quantity_affected: complaintState.quantityAffected,
        complaint_type: complaintState.complaintType,
        complaint_date: complaintState.complaintDate,
        detailed_description: complaintState.detailedDescription,
        initial_severity: complaintState.initialSeverity,
        priority: complaintState.priority,
        risk_summary: complaintState.riskSummary,
        suggested_capa: complaintState.suggestedCapa
      };

      const res = await fetch(`${API_BASE}/api/intake/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msgText,
          complaint_data: complaintContext,
          chat_history: chatState.messages,
          api_key: complaintState.groqApiKey
        })
      });

      chatDispatch({ type: 'SET_SENDING', payload: false });

      if (res.ok) {
        const json = await res.json();
        chatDispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id: Date.now() + 1,
            sender: 'assistant',
            role: 'assistant',
            content: json.reply
          }
        });
      }
    } catch (err) {
      chatDispatch({ type: 'SET_SENDING', payload: false });
      chatDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now() + 1,
          sender: 'assistant',
          role: 'assistant',
          content: "Sorry, I encountered an issue connecting to the QA assistant service."
        }
      });
    }
  };

  // 4. Save Complaint to DB
  const handleSaveComplaint = async () => {
    try {
      const payload = {
        complaint_source: complaintState.complaintSource,
        customer_name: complaintState.customerName,
        product_name: complaintState.productName,
        product_strength_grade: complaintState.productStrengthGrade,
        batch_lot_number: complaintState.batchLotNumber,
        manufacturing_date: complaintState.manufacturingDate,
        expiry_date: complaintState.expiryDate,
        quantity_affected: complaintState.quantityAffected,
        complaint_type: complaintState.complaintType,
        complaint_date: complaintState.complaintDate,
        detailed_description: complaintState.detailedDescription,
        initial_severity: complaintState.initialSeverity || 'Major',
        priority: complaintState.priority || 'Medium',
        status: 'Pending Triage',
        risk_summary: complaintState.riskSummary,
        suggested_capa: complaintState.suggestedCapa,
        raw_intake_text: complaintState.rawIntakeText
      };

      const res = await fetch(`${API_BASE}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchComplaints();
        complaintDispatch({ type: 'SET_FIELD', payload: { field: 'status', value: 'Saved' } });
        alert("✓ Complaint successfully logged into Pharma QMS Database!");
      }
    } catch (err) {
      alert("Error saving complaint to database: " + err.message);
    }
  };

  // 5. Delete Complaint
  const handleDeleteComplaint = async (id) => {
    if (!window.confirm(`Delete complaint #${id}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/complaints/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchComplaints();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-container">
      <Header
        status={complaintState.status}
        activeTab={complaintState.activeTab}
        onTabChange={(tab) => complaintDispatch({ type: 'SET_ACTIVE_TAB', payload: tab })}
        groqApiKey={complaintState.groqApiKey}
        onApiKeyChange={(key) => complaintDispatch({ type: 'SET_GROQ_API_KEY', payload: key })}
      />

      {complaintState.activeTab === 'intake' ? (
        <main className="main-grid">
          {/* Left Column: Log Complaint Form */}
          <ComplaintForm
            state={complaintState}
            dispatch={complaintDispatch}
            onSaveComplaint={handleSaveComplaint}
            onResetForm={() => complaintDispatch({ type: 'RESET_FORM' })}
          />

          {/* Right Column: AI Intake Assistant Panel */}
          <AIAssistantPanel
            complaintState={complaintState}
            chatState={chatState}
            onFileUpload={handleFileUpload}
            onTextSubmit={handleTextSubmit}
            onSendChatMessage={handleSendChatMessage}
          />
        </main>
      ) : (
        /* Quality Risk Dashboard View */
        <SavedComplaintsDashboard
          complaints={complaintState.savedComplaints}
          onDeleteComplaint={handleDeleteComplaint}
        />
      )}
    </div>
  );
}
