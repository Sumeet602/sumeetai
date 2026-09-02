import { createSlice } from '@reduxjs/toolkit';

const conversationSlice = createSlice({
  name: 'conversations',
  initialState: { list: [], activeId: null },
  reducers: {
    setConversations: (state, action) => { state.list = action.payload; },
    setActiveId: (state, action) => { state.activeId = action.payload; }
  }
});

export const { setConversations, setActiveId } = conversationSlice.actions;
export default conversationSlice.reducer;
