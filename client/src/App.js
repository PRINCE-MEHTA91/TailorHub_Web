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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Role-aware redirect hub */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* Customer Dashboard */}
          <Route
            path="/dashboard/customer"
            element={
              <PrivateRoute>
                <CustomerDashboardPage />
              </PrivateRoute>
            }
          />

          {/* Tailor Dashboard */}
          <Route
            path="/dashboard/tailor"
            element={
              <PrivateRoute>
                <TailorDashboardPage />
              </PrivateRoute>
            }
          />

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
