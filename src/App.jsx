import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import LandingPage from './pages/LandingPage';
import Documentation from './pages/Documentation';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// User Dashboard
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import Overview from './pages/Dashboard/Overview';
import MyKeys from './pages/Dashboard/MyKeys';
import Plans from './pages/Dashboard/Plans';
import Analytics from './pages/Dashboard/Analytics';
import BotConfig from './pages/Dashboard/BotConfig';
import Invoices from './pages/Dashboard/Invoices';
import Settings from './pages/Dashboard/Settings';

// Admin Portal
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import KeyManagement from './pages/Admin/KeyManagement';
import OrderManagement from './pages/Admin/OrderManagement';
import SystemLogs from './pages/Admin/SystemLogs';

// Layout wrapper for public pages that include the Navbar and Footer
function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <LandingPage />
                </PublicLayout>
              }
            />
            <Route
              path="/docs"
              element={
                <PublicLayout>
                  <Documentation />
                </PublicLayout>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* User Dashboard Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="keys" element={<MyKeys />} />
              <Route path="plans" element={<Plans />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="bot-config" element={<BotConfig />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Admin Portal Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="keys" element={<KeyManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="logs" element={<SystemLogs />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
