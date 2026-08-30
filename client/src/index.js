import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';

// REACT_APP_GOOGLE_CLIENT_ID must be set in Vercel Dashboard → Environment Variables.
// The hardcoded fallback below ensures the app still works even if the env var is missing.
const GOOGLE_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CLIENT_ID ||
  '524676083717-kgl31la777nh5uqgbmip1upnra8e6pjq.apps.googleusercontent.com';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
