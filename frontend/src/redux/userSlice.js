import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.currentUser = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logoutUser: (state) => {
      state.currentUser = null;
      state.error = null;
    },
    updateCredits: (state, action) => {
      if (state.currentUser) {
        state.currentUser.credits = action.payload;
      }
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logoutUser, updateCredits } = userSlice.actions;
export default userSlice.reducer;
