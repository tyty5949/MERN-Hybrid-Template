import React from 'react';
import ReactDOM from 'react-dom';
import { createAppContainerLazy } from '@containers/app';
import { initializeStore } from '@containers/app/slices';

const Dashboard = React.lazy(() => import('./DashboardContent'));

// Waiting to render the container until the DOM is loaded since
// we will be including this module's js in the template head
window.addEventListener('DOMContentLoaded', () => {
  const store = initializeStore({
    reducer: {},
  });

  ReactDOM.render(
    createAppContainerLazy(store, <Dashboard />),
    document.getElementById('dashboard-container'),
  );
});
