import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef AppState
 * @property {boolean} sideNavCollapsed - Whether or not the side nav should be collapsed
 */

/** @type {AppState} */
const initialState = {
  sideNavCollapsed: false,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    /**
     * Toggles the side nav open and closed.
     *
     * @param {AppState} [state]
     */
    toggleSideNavCollapse(state) {
      state.sideNavCollapsed = !state.sideNavCollapsed;
    },
  },
});

export const { toggleSideNavCollapse } = appSlice.actions;

export const appReducer = appSlice.reducer;
