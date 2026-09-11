// Redux Slice for Complaint Form & Intake State Management

const initialState = {
  // Form Fields
  complaintSource: '',
  customerName: '',
  productName: '',
  productStrengthGrade: '',
  batchLotNumber: '',
  manufacturingDate: '',
  expiryDate: '',
  quantityAffected: '',
  complaintType: '',
  complaintDate: new Date().toISOString().split('T')[0],
  detailedDescription: '',
  initialSeverity: '',
  priority: '',
  
  // Extra AI Outputs
  riskSummary: '',
  suggestedCapa: '',
  rawIntakeText: '',

  // AI Intake State
  status: 'Pending Triage', // Pending Triage | Extraction In Progress | Triaged | Saved
  isExtracting: false,
  extractionProgress: 0,
  extractionStatusText: 'Upload a complaint document or paste text above. I will automatically extract the details and populate the form for you.',
  
  // Highlighted fields for AI auto-fill effect
  highlightedFields: {},

  // Saved Complaints List (QMS DB view)
  savedComplaints: [],
  activeTab: 'intake', // 'intake' | 'dashboard' | 'settings'
  
  // Groq API Key
  groqApiKey: ''
};

export const complaintReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.payload.field]: action.payload.value
      };

    case 'SET_MULTIPLE_FIELDS':
      return {
        ...state,
        ...action.payload,
        highlightedFields: Object.keys(action.payload).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      };

    case 'CLEAR_HIGHLIGHTS':
      return {
        ...state,
        highlightedFields: {}
      };

    case 'START_EXTRACTION':
      return {
        ...state,
        isExtracting: true,
        extractionProgress: 25,
        extractionStatusText: 'Analyzing document content and extracting key details... Please wait, this may take a few moments.',
        status: 'Pending Triage'
      };

    case 'UPDATE_EXTRACTION_PROGRESS':
      return {
        ...state,
        extractionProgress: action.payload.progress,
        extractionStatusText: action.payload.statusText || state.extractionStatusText
      };

    case 'EXTRACTION_SUCCESS':
      const data = action.payload.data;
      return {
        ...state,
        isExtracting: false,
        extractionProgress: 100,
        extractionStatusText: 'Extraction completed successfully! Key details populated below.',
        status: 'Triaged',

        complaintSource: data.complaint_source || state.complaintSource,
        customerName: data.customer_name || state.customerName,
        productName: data.product_name || state.productName,
        productStrengthGrade: data.product_strength_grade || state.productStrengthGrade,
        batchLotNumber: data.batch_lot_number || state.batchLotNumber,
        manufacturingDate: data.manufacturing_date || state.manufacturingDate,
        expiryDate: data.expiry_date || state.expiryDate,
        quantityAffected: data.quantity_affected || state.quantityAffected,
        complaintType: data.complaint_type || state.complaintType,
        complaintDate: data.complaint_date || state.complaintDate,
        detailedDescription: data.detailed_description || state.detailedDescription,
        initialSeverity: data.initial_severity || state.initialSeverity,
        priority: data.priority || state.priority,
        riskSummary: data.risk_summary || state.riskSummary,
        suggestedCapa: data.suggested_capa || state.suggestedCapa,
        rawIntakeText: data.detailed_description || state.rawIntakeText,

        highlightedFields: {
          complaintSource: true,
          customerName: true,
          productName: true,
          productStrengthGrade: true,
          batchLotNumber: true,
          manufacturingDate: true,
          expiryDate: true,
          quantityAffected: true,
          complaintType: true,
          complaintDate: true,
          detailedDescription: true,
          initialSeverity: true,
          priority: true
        }
      };

    case 'EXTRACTION_FAILURE':
      return {
        ...state,
        isExtracting: false,
        extractionProgress: 0,
        extractionStatusText: `Extraction failed: ${action.payload.error || 'Unknown error'}`
      };

    case 'RESET_FORM':
      return {
        ...initialState,
        savedComplaints: state.savedComplaints,
        activeTab: state.activeTab,
        groqApiKey: state.groqApiKey
      };

    case 'SET_SAVED_COMPLAINTS':
      return {
        ...state,
        savedComplaints: action.payload
      };

    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        activeTab: action.payload
      };

    case 'SET_GROQ_API_KEY':
      return {
        ...state,
        groqApiKey: action.payload
      };

    default:
      return state;
  }
};
