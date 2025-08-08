import { ReactNode } from 'react';

interface UltraSimpleLayoutProps {
  children: ReactNode;
}

export default function UltraSimpleLayout({ children }: UltraSimpleLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}