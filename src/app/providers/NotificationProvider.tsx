/**
 * Notification Provider
 *
 * This component provides a centralized notification system for displaying
 * user-friendly messages, errors, and success states throughout the application.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createAppError, toAppError, type AppError, type AppErrorKind } from '@/shared/lib';
import { NotificationContainer, type Notification } from '@/shared/ui';

// Notification interface is now imported from @/shared/ui

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showError: (error: AppError | Error | unknown) => void;
  showStructuredError: (kind: string, message: string, details?: Record<string, unknown>) => void;
  showSuccess: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      id,
      duration: 5000, // Default 5 seconds
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showError = useCallback(
    (error: AppError | Error | unknown) => {
      // Convert any error to AppError for consistent handling
      const appError = toAppError(error);

      addNotification({
        type: 'error',
        title: 'Error',
        message: appError.message,
        duration: 8000, // Errors stay longer
      });
    },
    [addNotification]
  );

  const showSuccess = useCallback(
    (title: string, message: string) => {
      addNotification({
        type: 'success',
        title,
        message,
        duration: 3000,
      });
    },
    [addNotification]
  );

  const showWarning = useCallback(
    (title: string, message: string) => {
      addNotification({
        type: 'warning',
        title,
        message,
        duration: 5000,
      });
    },
    [addNotification]
  );

  const showInfo = useCallback(
    (title: string, message: string) => {
      addNotification({
        type: 'info',
        title,
        message,
        duration: 4000,
      });
    },
    [addNotification]
  );

  // Helper method to create and show structured errors
  const showStructuredError = useCallback(
    (kind: string, message: string, details?: Record<string, unknown>) => {
      const error = createAppError(kind as AppErrorKind, message, { details });
      showError(error);
    },
    [showError]
  );

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showError,
    showStructuredError,
    showSuccess,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
}
