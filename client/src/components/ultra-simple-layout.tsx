import { ReactNode } from 'react';
import ModernHeader from './modern-header';
import EnhancedFooter from './enhanced-footer';

interface UltraSimpleLayoutProps {
  children: ReactNode;
}

export default function UltraSimpleLayout({ children }: UltraSimpleLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <ModernHeader />
      <main className="pt-24 lg:pt-28">
        {children}
      </main>
      <EnhancedFooter />
    </div>
  );
}