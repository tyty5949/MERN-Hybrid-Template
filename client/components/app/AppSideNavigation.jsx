import React from 'react';
import { Layout, Menu } from 'antd';
import { VideoCameraOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const { Sider } = Layout;

/**
 * The side navigation for the app. Renders on the left side
 * of the webpage and has the ability to collapse collapse
 * and expand based on the variable 'state.app.sideNavCollapsed'.
 */
export const AppSideNavigation = () => {
  const { sideNavCollapsed } = useSelector((state) => state.app);

  return (
    <Sider id="app-side-nav" trigger={null} collapsible collapsed={sideNavCollapsed}>
      <div className="logo" />
      <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
        <Menu.Item key="1">
          <UserOutlined />
          <span>Dashboard</span>
        </Menu.Item>
        <Menu.Item key="2">
          <VideoCameraOutlined />
          <span>Service</span>
        </Menu.Item>
        <Menu.Item key="3">
          <UploadOutlined />
          <span>Game Servers</span>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};
