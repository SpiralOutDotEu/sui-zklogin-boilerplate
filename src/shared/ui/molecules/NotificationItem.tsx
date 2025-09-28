/**
 * NotificationItem Component
 *
 * A molecule component that displays individual notification items.
 * Part of the atomic design system - handles the presentation of a single notification.
 */

import React from 'react';
import { Icon } from '@/shared/ui';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationItemProps {
  notification: Notification;
  onRemove: () => void;
}

export function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const getIcon = () => {
    const iconProps = {
      size: 'lg' as const,
      className: 'w-5 h-5',
    };

    switch (notification.type) {
      case 'success':
        return <Icon name='check' {...iconProps} className='w-5 h-5 text-green-400' />;
      case 'error':
        return <Icon name='close' {...iconProps} className='w-5 h-5 text-red-400' />;
      case 'warning':
        return <Icon name='warning' {...iconProps} className='w-5 h-5 text-yellow-400' />;
      case 'info':
        return <Icon name='info' {...iconProps} className='w-5 h-5 text-blue-400' />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div
      className={`
        glass-effect rounded-lg p-4 border backdrop-blur-sm
        ${getBackgroundColor()}
        animate-in slide-in-from-right-full duration-300
      `}
    >
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0 mt-0.5'>{getIcon()}</div>
        <div className='flex-1 min-w-0'>
          <h4 className='text-sm font-semibold text-white'>{notification.title}</h4>
          <p className='text-sm text-white/70 mt-1'>{notification.message}</p>
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className='text-sm text-white/80 hover:text-white underline mt-2'
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onRemove}
          className='flex-shrink-0 text-white/50 hover:text-white transition-colors'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
