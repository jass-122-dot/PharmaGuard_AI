import React, { useState } from 'react';

export function SavedComplaintsDashboard({ complaints = [], onDeleteComplaint }) {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('All');

  const filtered = complaints.filter(c => {
    const matchesSearch = 
      (c.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.batch_lot_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.complaint_type || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSev = filterSeverity === 'All' || c.initial_severity === filterSeverity;
    return matchesSearch && matchesSev;
  });

  const criticalCount = complaints.filter(c => c.initial_severity === 'Critical').length;
  const majorCount = complaints.filter(c => c.initial_severity === 'Major').length;
  const minorCount = complaints.filter(c => c.initial_severity === 'Minor').length;

  return (
    <div className="qms-dashboard-wrap">
      {/* SUMMARY STATS BAR */}
      <div className="dashboard-stats-grid">
        <div className="stat-card total-card">
          <div className="stat-value">{complaints.length}</div>
          <div className="stat-label">Total Logged Complaints</div>
        </div>
        <div className="stat-card critical-card">
          <div className="stat-value">{criticalCount}</div>
          <div className="stat-label">Critical Risk (Immediate QA)</div>
        </div>
        <div className="stat-card major-card">
          <div className="stat-value">{majorCount}</div>
          <div className="stat-label">Major Risk (OOS / Process)</div>
        </div>
        <div className="stat-card minor-card">
          <div className="stat-value">{minorCount}</div>
          <div className="stat-label">Minor Risk (Cosmetic)</div>
        </div>
      </div>

      {/* FILTER & SEARCH ROW */}
      <div className="filter-row mb-4">
        <input
          type="text"
          className="search-input"
          placeholder="Search by Product, Batch #, Customer, or Defect..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="filter-select"
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical Only</option>
          <option value="Major">Major Only</option>
          <option value="Minor">Minor Only</option>
        </select>
      </div>

      {/* TABLE OF LOGGED COMPLAINTS */}
      <div className="dashboard-table-card">
        <table className="qms-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Product & Grade</th>
              <th>Batch / Lot</th>
              <th>Complaint Type</th>
              <th>Severity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-muted">
                  No complaint records logged yet. Fill out the intake form or extract details to add records.
                </td>
              </tr>
            ) : (
              filtered.map(c => (
                <tr key={c.id}>
                  <td><strong>#{c.id}</strong></td>
                  <td className="font-semibold">{c.customer_name || 'N/A'}</td>
                  <td>
                    <div>{c.product_name}</div>
                    <small className="text-muted">{c.product_strength_grade}</small>
                  </td>
                  <td><code className="batch-code">{c.batch_lot_number}</code></td>
                  <td>{c.complaint_type}</td>
                  <td>
                    <span className={`sev-badge sev-${(c.initial_severity || 'major').toLowerCase()}`}>
                      {c.initial_severity === 'Critical' ? '🔴' : c.initial_severity === 'Major' ? '🟠' : '🔵'} {c.initial_severity || 'Major'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-sm"
                      onClick={() => setSelectedComplaint(c)}
                    >
                      View QA Summary
                    </button>
                    <button 
                      className="btn-delete-action"
                      onClick={() => onDeleteComplaint(c.id)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* COMPLAINT RISK SUMMARY & RCA MODAL */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">
                Complaint Investigation Summary & RCA (# {selectedComplaint.id})
              </h3>
              <button className="modal-close-btn" onClick={() => setSelectedComplaint(null)}>×</button>
            </div>

            <div className="modal-body-scroll">
              <div className="grid-2 mb-4">
                <div>
                  <h4 className="meta-heading">Product Details</h4>
                  <p><strong>Name:</strong> {selectedComplaint.product_name}</p>
                  <p><strong>Grade/Strength:</strong> {selectedComplaint.product_strength_grade}</p>
                  <p><strong>Batch #:</strong> {selectedComplaint.batch_lot_number}</p>
                  <p><strong>Mfg Date:</strong> {selectedComplaint.manufacturing_date} | <strong>Exp Date:</strong> {selectedComplaint.expiry_date}</p>
                  <p><strong>Quantity Affected:</strong> {selectedComplaint.quantity_affected}</p>
                </div>
                <div>
                  <h4 className="meta-heading">Customer & Intake Info</h4>
                  <p><strong>Customer:</strong> {selectedComplaint.customer_name}</p>
                  <p><strong>Source:</strong> {selectedComplaint.complaint_source}</p>
                  <p><strong>Complaint Date:</strong> {selectedComplaint.complaint_date}</p>
                  <p><strong>Initial Severity:</strong> <span className={`sev-badge sev-${(selectedComplaint.initial_severity || 'major').toLowerCase()}`}>{selectedComplaint.initial_severity}</span></p>
                  <p><strong>Priority:</strong> {selectedComplaint.priority}</p>
                </div>
              </div>

              <div className="qms-section-box mb-4">
                <h4 className="box-title">Detailed Complaint Description</h4>
                <p className="box-text">{selectedComplaint.detailed_description}</p>
              </div>

              <div className="qms-section-box risk-box mb-4">
                <h4 className="box-title">AI Quality Risk Management Assessment (ICH Q9 / FDA 21 CFR 211)</h4>
                <p className="box-text">{selectedComplaint.risk_summary || "Risk assessment queued for formal QA review."}</p>
              </div>

              <div className="qms-section-box capa-box">
                <h4 className="box-title">Suggested Root Cause Analysis (RCA) & CAPA Action Items</h4>
                <pre className="capa-pre">{selectedComplaint.suggested_capa || "1. Issue sample retrieval request.\n2. Execute batch record review.\n3. Conduct 5-Why RCA."}</pre>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedComplaint(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()}>🖨 Export QA Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
