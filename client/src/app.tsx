import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import HomePage from './pages/Home/HomePage';
import SoftwareDetailPage from './pages/SoftwareDetail/SoftwareDetailPage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import AdminSoftwarePage from './pages/AdminSoftware/AdminSoftwarePage';
import AdminSettingsPage from './pages/AdminSettings/AdminSettingsPage';
import AdminUsersPage from './pages/AdminUsers/AdminUsersPage';
import FeedbackPage from './pages/Feedback/FeedbackPage';
import { AuthProvider } from './context/AuthContext';

const RoutesComponent = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="software/:id" element={<SoftwareDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="admin/software" element={<AdminSoftwarePage />} />
          <Route path="admin/settings" element={<AdminSettingsPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
};

export default RoutesComponent;
