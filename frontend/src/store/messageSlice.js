import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    list: [],
    artifacts: [],
    isLoading: false,
  },
  reducers: {
    setMessages: (state, action) => {
      state.list = action.payload;
    },
    addMessage: (state, action) => {
      state.list.push(action.payload);
    },
    setArtifacts: (state, action) => {
      state.artifacts = action.payload;
    },
    addArtifacts: (state, action) => {
      state.artifacts.push(...action.payload);
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearMessages: (state) => {
      state.list = [];
      state.artifacts = [];
    }
  },
});

export const { setMessages, addMessage, setArtifacts, addArtifacts, setIsLoading, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;
