import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
  name: "conversations",
  initialState: {
    list: [],
    selectedConversation: null,
  },
  reducers: {
    setConversations: (state, action) => {
      state.list = action.payload;
    },
    addConversation: (state, action) => {
      state.list.unshift(action.payload);
    },
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
  },
});

export const { setConversations, addConversation, setSelectedConversation } = conversationSlice.actions;
export default conversationSlice.reducer;
