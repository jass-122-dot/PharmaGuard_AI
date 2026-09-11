import React from 'react';

export function ComplaintForm({ state, dispatch, onSaveComplaint, onResetForm }) {
  const handleChange = (field, value) => {
    dispatch({ type: 'SET_FIELD', payload: { field, value } });
  };

  const isHl = (fieldName) => state.highlightedFields[fieldName] ? 'ai-highlight' : '';

  return (
    <div className="complaint-form-card">
      <form onSubmit={(e) => { e.preventDefault(); onSaveComplaint(); }}>
        
        {/* 1. ORIGIN & CUSTOMER DETAILS */}
        <div className="form-section">
          <h2 className="section-title">1. ORIGIN & CUSTOMER DETAILS</h2>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Complaint Source</label>
              <input
                type="text"
                className={`form-input ${isHl('complaintSource')}`}
                placeholder="Awaiting AI extraction..."
                value={state.complaintSource}
                onChange={(e) => handleChange('complaintSource', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Name</label>
              <input
                type="text"
                className={`form-input ${isHl('customerName')}`}
                placeholder="Awaiting AI extraction..."
                value={state.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 2. PRODUCT & BATCH IDENTIFICATION */}
        <div className="form-section">
          <h2 className="section-title">2. PRODUCT & BATCH IDENTIFICATION</h2>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className={`form-input ${isHl('productName')}`}
                placeholder="Awaiting AI extraction..."
                value={state.productName}
                onChange={(e) => handleChange('productName', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Product Strength/Grade</label>
              <input
                type="text"
                className={`form-input ${isHl('productStrengthGrade')}`}
                placeholder="Awaiting AI extraction..."
                value={state.productStrengthGrade}
                onChange={(e) => handleChange('productStrengthGrade', e.target.value)}
              />
            </div>
          </div>

          <div className="grid-2 mt-3">
            <div className="form-group">
              <label className="form-label">Batch/Lot Number</label>
              <input
                type="text"
                className={`form-input ${isHl('batchLotNumber')}`}
                placeholder="Awaiting AI extraction..."
                value={state.batchLotNumber}
                onChange={(e) => handleChange('batchLotNumber', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Manufacturing Date</label>
              <div className="input-icon-wrap">
                <input
                  type="text"
                  className={`form-input ${isHl('manufacturingDate')}`}
                  placeholder="Awaiting AI extraction..."
                  value={state.manufacturingDate}
                  onChange={(e) => handleChange('manufacturingDate', e.target.value)}
                />
                <span className="input-icon">📅</span>
              </div>
            </div>
          </div>

          <div className="grid-2 mt-3">
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <div className="input-icon-wrap">
                <input
                  type="text"
                  className={`form-input ${isHl('expiryDate')}`}
                  placeholder="Awaiting AI extraction..."
                  value={state.expiryDate}
                  onChange={(e) => handleChange('expiryDate', e.target.value)}
                />
                <span className="input-icon">📅</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Affected</label>
              <div className="input-suffix-wrap">
                <input
                  type="text"
                  className={`form-input suffix-input ${isHl('quantityAffected')}`}
                  placeholder="Awaiting AI extraction..."
                  value={state.quantityAffected}
                  onChange={(e) => handleChange('quantityAffected', e.target.value)}
                />
                <span className="input-suffix">kg</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. COMPLAINT DETAILS */}
        <div className="form-section">
          <h2 className="section-title">3. COMPLAINT DETAILS</h2>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Complaint Type</label>
              <input
                type="text"
                className={`form-input ${isHl('complaintType')}`}
                placeholder="Awaiting AI extraction..."
                value={state.complaintType}
                onChange={(e) => handleChange('complaintType', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Complaint Date</label>
              <div className="input-icon-wrap">
                <input
                  type="text"
                  className={`form-input ${isHl('complaintDate')}`}
                  placeholder="Awaiting AI extraction..."
                  value={state.complaintDate}
                  onChange={(e) => handleChange('complaintDate', e.target.value)}
                />
                <span className="input-icon">📅</span>
              </div>
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="form-label">Detailed Complaint Description</label>
            <textarea
              className={`form-textarea ${isHl('detailedDescription')}`}
              rows={4}
              placeholder="Awaiting AI extraction..."
              value={state.detailedDescription}
              onChange={(e) => handleChange('detailedDescription', e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* 4. INITIAL ASSESSMENT & PRIORITY */}
        <div className="form-section">
          <h2 className="section-title">4. INITIAL ASSESSMENT & PRIORITY</h2>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Initial Severity</label>
              <div className="select-wrap">
                <select
                  className={`form-select ${isHl('initialSeverity')}`}
                  value={state.initialSeverity}
                  onChange={(e) => handleChange('initialSeverity', e.target.value)}
                >
                  <option value="">Awaiting AI extraction...</option>
                  <option value="Critical">Critical (Sterility / Safety Risk)</option>
                  <option value="Major">Major (OOS / Quality Standard Breach)</option>
                  <option value="Minor">Minor (Cosmetic / Packaging Defect)</option>
                </select>
                <span className="select-arrow">∨</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <div className="select-wrap">
                <select
                  className={`form-select ${isHl('priority')}`}
                  value={state.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  <option value="">Awaiting AI extraction...</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <span className="select-arrow">∨</span>
              </div>
            </div>
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="form-actions-row">
          <button
            type="button"
            className="btn btn-outline"
            onClick={onResetForm}
          >
            <span className="btn-icon">↺</span> Reset Form
          </button>
          <button
            type="submit"
            className="btn btn-primary"
          >
            <span className="btn-icon">💾</span> Save Complaint
          </button>
        </div>
      </form>
    </div>
  );
}
