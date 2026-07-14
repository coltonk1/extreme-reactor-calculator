import { Metadata } from 'next';
import CalculatorPageClient from './CalculatorPageClient';
import { Suspense } from 'react';

export const metadata: Metadata = {
  alternates: {
    canonical: '/calculator',
  },
};

export default function Page() {
  return (
    <Suspense fallback={<p>Loading calculator...</p>}>
      <CalculatorPageClient />
    </Suspense>
  );
}
