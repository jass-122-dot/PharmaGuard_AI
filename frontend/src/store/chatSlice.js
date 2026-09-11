// Redux Slice for AI Assistant Chat State Management

const initialState = {
  messages: [
    {
      id: 1,
      sender: 'assistant',
      role: 'assistant',
      content: 'Upload a complaint document or paste text above. I will automatically extract the details and populate the form for you.'
    }
  ],
  isSending: false
};

export const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload]
      };

    case 'SET_SENDING':
      return {
        ...state,
        isSending: action.payload
      };

    case 'CLEAR_CHAT':
      return initialState;

    default:
      return state;
  }
};
