/**
 * NotificationContainer Component
 *
 * An organism component that manages the layout and rendering of multiple notifications.
 * Part of the atomic design system - handles the container logic for notifications.
 */

import React from 'react';
import { NotificationItem, type Notification } from '@/shared/ui';

interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export function NotificationContainer({ notifications, onRemove }: NotificationContainerProps) {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className='fixed top-4 right-4 z-50 space-y-2 max-w-sm'>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
}
