import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  title: 'Extreme Reactors 2 Calculator | Reactor Planner Tool',
  description: 'Plan and simulate Extreme Reactors 2 builds. Adjust dimensions, place blocks, and view heat, power, and fuel usage in real time.',
  keywords: ['Extreme Reactors 2', 'Minecraft reactor calculator', 'reactor planner', 'Extreme Reactors simulator', 'Minecraft mod tools'],
};

// TODO: Change mobile page to only be for the landing page instead of all pages.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-neutral-800">
        <div className="h-[calc(100dvh-2.5rem)] flex flex-col">
          <header className="h-14 py-6 flex justify-between items-center px-6 bg-neutral-950 sticky top-0 z-30">
            {
              // eslint-disable-next-line @next/next/no-html-link-for-pages
              <a href="/" className="text-lg font-semibold tracking-tight text-neutral-200">
                Extreme Reactor 2 Calculator
              </a>
            }
            <div className="flex items-center gap-6">
              <Link href="/calculator" className="text-neutral-400 hover:text-neutral-200">
                Calculator
              </Link>
            </div>
          </header>
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center">
                <p className="text-neutral-300">Loading...</p>
              </div>
            }
          >
            <main className="overflow-hidden flex">{children}</main>
          </Suspense>
        </div>

        <div className="h-10 block text-transparent">FILLER</div>
        <footer className="h-fit z-20 py-2 flex items-center justify-center gap-6 text-sm text-neutral-400 bg-neutral-950 fixed bottom-0 w-full">
          <Link href="https://github.com/coltonk1/extreme-reactor-calculator/blob/master/LICENSE.md" target="_blank" className="hover:text-neutral-200">
            License
          </Link>

          <Link href="https://github.com/coltonk1/extreme-reactor-calculator/issues" target="_blank" className="hover:text-neutral-200">
            Questions / Suggestions / Issues
          </Link>
        </footer>

        <GoogleAnalytics gaId="G-5Q8T3VNG19" />
      </body>
    </html>
  );
}
