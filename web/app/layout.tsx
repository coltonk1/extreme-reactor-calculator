import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Extreme Reactors 2 Calculator | Reactor Planner Tool',
  description: 'Plan and simulate Extreme Reactors 2 builds. Adjust dimensions, place blocks, and view heat, power, and fuel usage in real time.',
  keywords: ['Extreme Reactors 2', 'Minecraft reactor calculator', 'reactor planner', 'Extreme Reactors simulator', 'Minecraft mod tools'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="max-h-screen h-full flex flex-col bg-neutral-800">
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/90 text-neutral-200 lg:hidden">
          <div className="max-w-sm text-center px-6">
            <h2 className="text-xl font-semibold mb-2">Larger screen required</h2>
            <p className="text-sm text-neutral-400">This calculator is designed for desktop layouts. Please open it on a larger device.</p>
          </div>
        </div>

        <header className="h-14 py-6 flex items-center px-6 bg-neutral-950">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-200">Extreme Reactor 2 Calculator</h1>
        </header>
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center">
              <p className="text-neutral-300">Loading...</p>
            </div>
          }
        >
          <main className="flex-1 overflow-hidden">{children}</main>
        </Suspense>
        <footer className="h-10 flex items-center justify-center gap-6 text-sm text-neutral-400 bg-neutral-950 border-t border-black">
          <Link href="https://github.com/coltonk1/extreme-reactor-calculator/blob/master/LICENSE.md" target="_blank" className="hover:text-neutral-200">
            License
          </Link>

          <Link href="https://github.com/coltonk1/extreme-reactor-calculator/issues" target="_blank" className="hover:text-neutral-200">
            Questions / Suggestions / Issues
          </Link>
        </footer>
      </body>
    </html>
  );
}
