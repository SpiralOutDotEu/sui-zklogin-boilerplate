import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { AppLayout, Home, ErrorBoundary, NotificationProvider } from '@/app';
import { Profile } from '@/features/profile';
import { TestTx } from '@/features/transactions';
import { UIGallery } from '@/features/gallery';
import { AuthCallback, ZkLoginProvider } from '@/features/auth';

/**
 * Application Router Configuration
 *
 * Defines the routing structure for the zkLogin application:
 * - Main app routes are wrapped in AppLayout for consistent UI
 * - Auth callback is separate to handle OAuth redirects
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> }, // Landing page
      { path: 'profile', element: <Profile /> }, // User profile
      { path: 'test_tx', element: <TestTx /> }, // Transaction testing
      { path: 'gallery', element: <UIGallery /> }, // UI component gallery
    ],
  },
  { path: '/auth/callback', element: <AuthCallback /> }, // OAuth callback handler
]);

/**
 * Application Entry Point
 *
 * Renders the React application with:
 * - ZkLoginProvider for authentication state management
 * - React Router for navigation
 * - StrictMode for development checks
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(_error, _errorInfo) => {
        // In production, send to error reporting service
        // Example: Sentry.captureException(error, { extra: errorInfo });
        // For now, we'll let the error boundary handle the display
      }}
    >
      <NotificationProvider>
        <ZkLoginProvider>
          <RouterProvider router={router} />
        </ZkLoginProvider>
      </NotificationProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
