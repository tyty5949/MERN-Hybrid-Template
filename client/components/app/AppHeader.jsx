import React from 'react';
import { Layout } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSideNavCollapse } from '@containers/app/slices/app';

const { Header } = Layout;

/**
 * The app header which displays at the top of the app. Includes
 * functionality to collapse the side nav.
 */
export const AppHeader = () => {
  const dispatch = useDispatch();
  const { sideNavCollapsed } = useSelector((state) => state.app);

  const toggle = () => {
    dispatch(toggleSideNavCollapse());
  };

  return (
    <Header id="app-header" className="app-layout-background" style={{ padding: 0 }}>
      {React.createElement(sideNavCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
        className: 'trigger',
        onClick: toggle,
      })}
    </Header>
  );
};
