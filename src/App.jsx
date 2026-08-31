import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages (Lazy Loaded)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Documentation = lazy(() => import('./pages/Documentation'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// User Dashboard Pages (Lazy Loaded)
const DashboardLayout = lazy(() => import('./pages/Dashboard/DashboardLayout'));
const Overview = lazy(() => import('./pages/Dashboard/Overview'));
const MyKeys = lazy(() => import('./pages/Dashboard/MyKeys'));
const Plans = lazy(() => import('./pages/Dashboard/Plans'));
const Analytics = lazy(() => import('./pages/Dashboard/Analytics'));
const BotConfig = lazy(() => import('./pages/Dashboard/BotConfig'));
const Invoices = lazy(() => import('./pages/Dashboard/Invoices'));
const Settings = lazy(() => import('./pages/Dashboard/Settings'));

// Admin Portal Pages (Lazy Loaded)
const AdminLayout = lazy(() => import('./pages/Admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/Admin/UserManagement'));
const KeyManagement = lazy(() => import('./pages/Admin/KeyManagement'));
const OrderManagement = lazy(() => import('./pages/Admin/OrderManagement'));
const SystemLogs = lazy(() => import('./pages/Admin/SystemLogs'));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Rendering Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08090D] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold">Something went wrong</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-md">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="mt-6 px-5 py-2.5 rounded-xl btn-gradient-purple text-xs font-bold"
          >
            Reload Platform
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Fallback Loading Spinner
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
    </div>
  );
}

// Public Layout
function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#08090D] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
