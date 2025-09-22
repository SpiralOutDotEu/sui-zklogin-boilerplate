import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import AppLayout from "./ui/AppLayout";
import Home from "./routes/Home";
import Profile from "./routes/Profile";
import TestTx from "./routes/TestTx";
import AuthCallback from "./routes/auth/AuthCallback";
import { ZkLoginProvider } from "./state/ZkLoginProvider";

/**
 * Application Router Configuration
 *
 * Defines the routing structure for the zkLogin application:
 * - Main app routes are wrapped in AppLayout for consistent UI
 * - Auth callback is separate to handle OAuth redirects
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> }, // Landing page
      { path: "profile", element: <Profile /> }, // User profile
      { path: "test_tx", element: <TestTx /> }, // Transaction testing
    ],
  },
  { path: "/auth/callback", element: <AuthCallback /> }, // OAuth callback handler
]);

/**
 * Application Entry Point
 *
 * Renders the React application with:
 * - ZkLoginProvider for authentication state management
 * - React Router for navigation
 * - StrictMode for development checks
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ZkLoginProvider>
      <RouterProvider router={router} />
    </ZkLoginProvider>
  </React.StrictMode>
);
