import { createSlice } from '@reduxjs/toolkit';

const messageSlice = createSlice({
  name: 'messages',
  initialState: { dict: {} },
  reducers: {
    setMessages: (state, action) => {
        const { conversationId, messages } = action.payload;
        state.dict[conversationId] = messages;
    },
    addMessage: (state, action) => {
        const { conversationId, message } = action.payload;
        if (!state.dict[conversationId]) state.dict[conversationId] = [];
        state.dict[conversationId].push(message);
    }
  }
});

export const { setMessages, addMessage } = messageSlice.actions;
export default messageSlice.reducer;
