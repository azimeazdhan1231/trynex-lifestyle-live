import { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UltraSimpleLayoutProps {
  children: ReactNode;
}

export default function UltraSimpleLayout({ children }: UltraSimpleLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="pt-24 lg:pt-28">
        {children}
      </main>
      <Footer />
    </div>
  );
}