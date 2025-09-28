import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/app/components';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// No props needed for this component

// ============================================================================
// CONSTANTS
// ============================================================================

const LAYOUT_CLASSES = {
  container: 'min-h-screen flex flex-col relative overflow-hidden',
  background: 'fixed inset-0 -z-10',
  main: 'flex-1 relative z-10',
  mainContent: 'max-w-7xl mx-auto px-6 py-8',
  footer: 'glass-effect border-t border-white/10 mt-auto',
  footerContent: 'max-w-7xl mx-auto px-6 py-4 text-center',
  footerText: 'text-xs text-white/50',
} as const;

const BACKGROUND_EFFECTS = [
  {
    className:
      'absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow',
  },
  {
    className:
      'absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse-slow delay-1000',
  },
  {
    className:
      'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow delay-500',
  },
] as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * AppLayout Component
 *
 * Main application layout wrapper that provides:
 * - Consistent page structure with header, main content, and footer
 * - Animated background effects for visual appeal
 * - Responsive design with proper spacing and z-index management
 * - Glass morphism effects for modern UI aesthetics
 *
 * @returns JSX element containing the complete app layout
 */
export default function AppLayout() {
  return (
    <div className={LAYOUT_CLASSES.container}>
      {/* Animated Background Effects */}
      <div className={LAYOUT_CLASSES.background}>
        {BACKGROUND_EFFECTS.map((effect, index) => (
          <div key={index} className={effect.className} />
        ))}
      </div>

      {/* Navigation Header */}
      <Navbar />

      {/* Main Content Area */}
      <main className={LAYOUT_CLASSES.main}>
        <div className={LAYOUT_CLASSES.mainContent}>
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className={LAYOUT_CLASSES.footer}>
        <div className={LAYOUT_CLASSES.footerContent}>
          <p className={LAYOUT_CLASSES.footerText}>
            Demo only. Do not store secrets in localStorage.
          </p>
        </div>
      </footer>
    </div>
  );
}
