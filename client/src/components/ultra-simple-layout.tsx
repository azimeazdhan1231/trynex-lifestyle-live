import { ReactNode } from 'react';
import ModernHeader from './modern-header';
import EnhancedFooter from './enhanced-footer';

interface UltraSimpleLayoutProps {
  children: ReactNode;
}

export default function UltraSimpleLayout({ children }: UltraSimpleLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader />
      <main className="pt-20 lg:pt-24">
        {children}
      </main>
      <EnhancedFooter />
    </div>
  );
}