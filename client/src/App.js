import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './home.css';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import BottomNav from './components/BottomNav';
import IndexPage from './pages/IndexPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import TailorDashboardPage from './pages/TailorDashboardPage';
import PendingJobsPage from './pages/PendingJobsPage';
import CompletedOrdersPage from './pages/CompletedOrdersPage';
import EarningsPage from './pages/EarningsPage';
import TailorDetailsPage from './pages/TailorDetailsPage';
import BookingPage from './pages/BookingPage';

/* ── Smart Home Route ──────────────────────────────────────────
   If user is already logged in, redirect to their role dashboard.
   Otherwise, show the normal public home page.
──────────────────────────────────────────────────────────────── */
const SmartHomeRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // wait for auth check

  if (user) {
    const dest = user.role === 'tailor' ? '/tailor/dashboard' : '/customer/dashboard';
    return <Navigate to={dest} replace />;
  }

  return (
    <div className="bg-light-gray font-poppins pb-16">
      <Header />
      <SearchBar />
      <IndexPage />
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Role-specific dashboards */}
          <Route path="/customer/dashboard" element={<PrivateRoute role="customer"><CustomerDashboardPage /></PrivateRoute>} />
          <Route path="/tailor/dashboard" element={<PrivateRoute role="tailor"><TailorDashboardPage /></PrivateRoute>} />

          {/* Generic /dashboard fallback — smart-switches by role */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

          {/* Tailor Detail Pages */}
          <Route path="/tailor/pending-jobs" element={<PrivateRoute role="tailor"><PendingJobsPage /></PrivateRoute>} />
          <Route path="/tailor/completed" element={<PrivateRoute role="tailor"><CompletedOrdersPage /></PrivateRoute>} />
          <Route path="/tailor/earnings" element={<PrivateRoute role="tailor"><EarningsPage /></PrivateRoute>} />

          <Route path="/tailor-profile/:id" element={<TailorDetailsPage />} />
          <Route path="/book-appointment/:id" element={<BookingPage />} />

          {/* Home Page — auto-redirects logged-in users to their dashboard */}
          <Route path="/" element={<SmartHomeRoute />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
