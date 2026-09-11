// Central Redux Store
import { complaintReducer } from './complaintSlice.js';
import { chatReducer } from './chatSlice.js';

export function createQMSStore() {
  let state = {
    complaint: complaintReducer(undefined, { type: '@@INIT' }),
    chat: chatReducer(undefined, { type: '@@INIT' })
  };

  let listeners = [];

  return {
    getState: () => state,
    dispatch: (action) => {
      state = {
        complaint: complaintReducer(state.complaint, action),
        chat: chatReducer(state.chat, action)
      };
      listeners.forEach(listener => listener());
      return action;
    },
    subscribe: (listener) => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    }
  };
}
