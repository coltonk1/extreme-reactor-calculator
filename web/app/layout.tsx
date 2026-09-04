import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  metadataBase: new URL('https://er2.coltonkaraffa.com'),
  title: 'Extreme Reactors 2 Calculator | Reactor Planner Tool',
  description: 'Plan and simulate Extreme Reactors 2 builds. Adjust dimensions, place blocks, and view heat, power, steam production, and fuel usage in real time.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Extreme Reactors 2 Calculator | Reactor Planner Tool',
    description: 'Plan, simulate, and optimize Extreme Reactors 2 reactors directly in your browser.',
    siteName: 'Extreme Reactors 2 Calculator',
    images: [
      {
        url: '/overview.png',
        width: 1920,
        height: 1080,
        alt: 'Extreme Reactors 2 Calculator interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Extreme Reactors 2 Calculator | Reactor Planner Tool',
    description: 'Plan, simulate, and optimize Extreme Reactors 2 reactors directly in your browser.',
    images: ['/overview.png'],
  },
};

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
                Extreme Reactors 2 Calculator
              </a>
            }
            <div className="flex items-center gap-6">
              <Link href="/calculator" className="text-neutral-400 hover:text-neutral-200">
                Calculator
              </Link>
            </div>
          </header>
          <main className="overflow-hidden flex">{children}</main>
        </div>

        <div className="h-10 block text-transparent"></div>
        <footer className="h-fit z-20 py-2 flex items-center justify-center gap-6 text-sm text-neutral-400 bg-neutral-950 fixed bottom-0 w-full">
          <Link href="https://github.com/coltonk1/extreme-reactor-calculator/blob/master/LICENSE.md" target="_blank" className="hover:text-neutral-200">
            License
          </Link>

          <Link href="https://github.com/coltonk1/extreme-reactor-calculator/issues" target="_blank" className="hover:text-neutral-200">
            Questions / Suggestions / Issues
          </Link>
        </footer>

        {process.env.NODE_ENV === 'production' && <GoogleAnalytics gaId="G-5Q8T3VNG19" />}
      </body>
    </html>
  );
}
