import { Metadata } from 'next';
import CalculatorPageClient from './CalculatorPageClient';
import { Suspense } from 'react';
import { ReactorStateProvider } from '@/components/ReactorStateProvider';

export const metadata: Metadata = {
  alternates: {
    canonical: '/calculator',
  },
};

export default function Page() {
  return (
    <Suspense fallback={<p>Loading calculator...</p>}>
      <ReactorStateProvider>
        <CalculatorPageClient />
      </ReactorStateProvider>
    </Suspense>
  );
}
