import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

          {/* Smart role-redirect hub — redirects to /dashboard/customer or /dashboard/tailor */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

          {/* Role-protected Customer Dashboard */}
          <Route
            path="/dashboard/customer"
            element={
              <PrivateRoute role="customer">
                <CustomerDashboardPage />
              </PrivateRoute>
            }
          />

          {/* Role-protected Tailor Dashboard */}
          <Route
            path="/dashboard/tailor"
            element={
              <PrivateRoute role="tailor">
                <TailorDashboardPage />
              </PrivateRoute>
            }
          />

          {/* Tailor Detail Pages */}
          <Route path="/tailor/pending-jobs" element={<PrivateRoute role="tailor"><PendingJobsPage /></PrivateRoute>} />
          <Route path="/tailor/completed" element={<PrivateRoute role="tailor"><CompletedOrdersPage /></PrivateRoute>} />
          <Route path="/tailor/earnings" element={<PrivateRoute role="tailor"><EarningsPage /></PrivateRoute>} />

          {/* Home Page */}
          <Route
            path="/"
            element={
              <div className="bg-light-gray font-poppins pb-16">
                <Header />
                <SearchBar />
                <IndexPage />
                <BottomNav />
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
