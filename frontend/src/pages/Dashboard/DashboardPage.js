import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

const DashboardPage = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default DashboardPage;
