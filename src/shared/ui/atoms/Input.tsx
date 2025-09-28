import React from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Input Component - Atomic Design
 *
 * A reusable input component with consistent styling and validation states.
 *
 * @param props - Input props
 * @returns JSX element
 */
export default function Input({
  label,
  error,
  helperText,
  size = 'md',
  fullWidth = false,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  const baseClasses =
    'block border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black';
  const sizeClasses = SIZES[size];
  const widthClasses = fullWidth ? 'w-full' : '';
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300';
  const disabledClasses = props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';

  const inputClasses =
    `${baseClasses} ${sizeClasses} ${widthClasses} ${errorClasses} ${disabledClasses} ${className}`.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label htmlFor={inputId} className='block text-sm font-medium text-gray-700 mb-1'>
          {label}
        </label>
      )}
      <input id={inputId} className={inputClasses} {...props} />
      {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}
      {helperText && !error && <p className='mt-1 text-sm text-gray-500'>{helperText}</p>}
    </div>
  );
}
