import React, { useState } from 'react';

export function PasteTextModal({ isOpen, onClose, onSubmitText }) {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmitText(text);
    setText('');
    onClose();
  };

  const loadSampleAPI = () => {
    setText(
`COMPLAINT REPORT - API QUALITY ASSURANCE
Date: 2026-09-08
From: Apex Pharmaceuticals Ltd (Quality Control Dept)
Customer Contact: Dr. Robert Vance (qc@apexpharma.com)
Product: Paracetamol (Acetaminophen) API
Grade/Strength: Ph. Eur. / USP Micronized Grade 99.8%
Batch/Lot Number: LOT-2026-X891
Mfg Date: 2026-01-15 | Expiry Date: 2028-01-14
Quantity Affected: 500 kg (in 25 fiber drums)

Incident Summary:
During incoming receiving inspection and HPLC assay testing at our formulation facility, Lot-2026-X891 failed the total related substances specification (OOS reported at 0.45% vs limit of <= 0.15%). Additionally, 3 fiber drums showed damaged inner tamper-evident polythene seals. Please initiate immediate QA investigation, review retain samples, and confirm CAPA protocol.`
    );
  };

  const loadSampleFDF = () => {
    setText(
`CUSTOMER COMPLAINT EMAIL - FINISHED DOSAGE FORM (FDF)
Date: 2026-09-07
From: Metro Central Hospital Pharmacy
Customer Contact: Sarah Jenkins, Chief Pharmacist (sjenkins@metrohospital.org)
Product Name: Amoxicillin Trihydrate 500mg Capsules
Batch Number: BATCH-99412
Manufacturing Date: 2026-03-10
Expiry Date: 2028-03-09
Quantity Affected: 1,200 blister cards (12,000 capsules)

Description:
Hospital staff reported significant physical discoloration (dark yellow spots) on capsules from blister pack Lot BATCH-99412. Two patients also reported broken capsule shells inside unopened blisters. Please log as high priority complaint and advise on immediate recall/replacement procedure.`
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">Paste Complaint Text / Customer Email</h3>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="sample-buttons-row mb-3">
          <span className="sample-label">Try sample pharma text:</span>
          <button type="button" className="btn-sm btn-sample" onClick={loadSampleAPI}>
            🧪 Sample API Complaint (OOS Assay)
          </button>
          <button type="button" className="btn-sm btn-sample" onClick={loadSampleFDF}>
            💊 Sample FDF Complaint (Tablet Discoloration)
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            className="modal-textarea"
            rows={10}
            placeholder="Paste raw email message, customer letter, or QA deviation report text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!text.trim()}>
              ⚡ Extract Complaint Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
