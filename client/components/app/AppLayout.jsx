import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import { AppSideNavigation } from './AppSideNavigation';
import { AppHeader } from './AppHeader';
import './AppLayout.scss';

const { Content, Footer } = Layout;

/**
 * The component which wraps the entire app and applies the layout
 * for the side nav, header, footer, and main content.
 *
 * @param children
 */
export const AppLayout = ({ children }) => {
  return (
    <Layout className="h100">
      <AppSideNavigation />
      <Layout>
        <AppHeader />
        <Content id="app-content">{children}</Content>
        <Footer id="app-footer">Your Copyright Here ©2020</Footer>
      </Layout>
    </Layout>
  );
};

AppLayout.propTypes = {
  children: PropTypes.element.isRequired,
};
