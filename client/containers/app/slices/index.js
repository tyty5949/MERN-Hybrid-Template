import { configureStore } from '@reduxjs/toolkit';
import { appReducer } from './app';
import { userReducer, initializeUserDetails } from './user';

/**
 * Function to initialize the redux store for the app. Automatically
 * includes the reducers which are shared throughout all pages.
 *
 * @param reducer - An object of slice reducers that will be passed to configureStore().
 */
export const initializeStore = ({ reducer }) => {
  const store = configureStore({
    reducer: {
      ...reducer,
      app: appReducer,
      user: userReducer,
    },
  });

  store.dispatch(initializeUserDetails());

  return store;
};

export { appReducer, userReducer };
