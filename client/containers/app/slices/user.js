import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef UserState
 * @property {string} id         - The unique identifier for the user signed into the app
 * @property {string} username   - The username of the user logged in to the app
 */

/**
 * @type {UserState}
 */
const initialState = {
  id: '',
  username: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Sets the user's data in state.
     *
     * @param {UserState} [state]
     * @param payload
     * @param {string} payload.id        - The name of the user.
     * @param {string} payload.username  - The email of the user.
     */
    setUser(state, { payload }) {
      state.id = payload.id;
      state.username = payload.username;
    },
  },
});

export const { setUser } = userSlice.actions;

export const userReducer = userSlice.reducer;

export const initializeUserDetails = () => {
  return async (dispatch) => {
    const { dataset } = document.getElementById('app-container');

    const payload = {
      id: dataset.userId,
      username: dataset.username,
    };

    dispatch(setUser(payload));
  };
};
