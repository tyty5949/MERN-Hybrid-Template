import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { AppLayout } from '@components/app/AppLayout';

/**
 * Default spin loader for when none is specified.
 */
const contentFallbackLoader = (
  <Spin
    className="app-content-fallback-spin"
    indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />}
  />
);

/**
 * Creates container which contains all the components of the web app.
 * This includes the layout, navigation, and content.
 *
 * @param store   - Configured Redux store
 * @param content - The main content to be rendered in the app
 *
 * @returns React.FunctionComponent
 */
export const createAppContainer = (store, content) => (
  <Provider store={store}>
    <AppLayout>{content}</AppLayout>
  </Provider>
);

/**
 * Creates container which contains all the components of the web app.
 * This includes the layout, navigation, and content.
 *
 * NOTE:  This function assumes the content is being lazy loaded and
 *        wraps it in a Suspense with a fallback component.
 *
 * @param store     - Configured Redux store
 * @param content   - The main content to be rendered in the app
 * @param fallback  - (optional) The fallback component to render
 *
 * @returns React.FunctionComponent
 */
export const createAppContainerLazy = (store, content, fallback = contentFallbackLoader) =>
  createAppContainer(store, <Suspense fallback={fallback}>{content}</Suspense>);
