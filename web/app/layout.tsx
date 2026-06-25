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
        <div className="h-[calc(100dvh-2.5rem)] hidden md:flex flex-col">
          <header className="h-14 py-6 flex justify-between items-center px-6 bg-neutral-950 sticky top-0 z-30">
            <Link href="/" className="text-lg font-semibold tracking-tight text-neutral-200">
              Extreme Reactor 2 Calculator
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/" className="text-neutral-400 hover:text-neutral-200">
                Calculator
              </Link>
              <Link href="/about" className="text-neutral-400 hover:text-neutral-200">
                About
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
            {/* <div className="md:hidden fixed inset-0 bg-neutral-900/95 z-50 flex items-center justify-center p-6" aria-hidden="true">
              <div className="text-center max-w-sm">
                <p className="text-white text-lg font-semibold mb-2">Desktop required</p>
                <p className="text-neutral-400 text-sm">This tool is not usable on small screens. Please open it on a larger device.</p>
              </div>
            </div> */}

            <main className="overflow-hidden hidden md:flex">{children}</main>
          </Suspense>
        </div>

        <section className="md:hidden px-6 py-10 space-y-10 text-neutral-200">
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">Extreme Reactors 2 Calculator</h1>
          </div>

          <div className="flex flex-col text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-2 rounded">
            <h2 className="text-md font-semibold">Desktop Required</h2>

            <p className="mt-2 text-sm leading-6">
              The Extreme Reactors 2 Calculator is not accessible on small screens. The planner requires a larger display to properly view and edit reactor layouts. Please use a desktop or laptop for
              the full tool.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">About</h2>

            <p className="text-sm leading-6 text-neutral-300">This project is an interactive planner for designing and simulating Extreme Reactors 2 reactor layouts before building them in game.</p>

            <p className="text-sm leading-6 text-neutral-300">The calculator provides real time feedback for power generation, fuel usage, heat, and efficiency.</p>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Features</h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Real Time Simulation',
                  description: 'View RF/t, steam output, heat, and fuel usage instantly.',
                },
                {
                  title: 'Layout Planning',
                  description: 'Test moderators and fuel rod arrangements before building.',
                },
                {
                  title: 'Accurate ER2 Logic',
                  description: 'Simulation behavior is based on Extreme Reactors 2.',
                },
                {
                  title: 'Open Source',
                  description: 'Publicly available and open to community contributions.',
                },
              ].map((item, index) => (
                <div key={index} className="rounded border border-white/10 bg-white/5 p-4">
                  <h3 className="text-sm font-medium text-white">{item.title}</h3>

                  <p className="mt-1 text-sm leading-6 text-neutral-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Inspiration</h2>

            <p className="text-sm leading-6 text-neutral-300">
              This project was inspired by the original Big Reactors planner at{' '}
              <Link href="https://br.sidoh.org/" target="_blank" className="text-blue-500">
                br.sidoh.org
              </Link>
              , recreated for Extreme Reactors 2 with a modern interface and updated simulation support.
            </p>

            <p className="text-sm leading-6 text-neutral-300">
              The goal was to create a fast and accessible way to design, test, and optimize reactors without relying entirely on in game experimentation.
            </p>
          </div>
        </section>

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
