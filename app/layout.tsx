import './global.css';

import { ClientProviders } from '@/components/providers/ClientProviders';
import OnchainProviders from '@/OnchainProviders';

import { ThemeProviders } from '../src/components/providers/ThemeProvider';
import { inter, zen, monospace } from './fonts';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  manifest: '/manifest.json',
  title: 'Eve Finance',
  description: 'Ask Eve what to invest in DeFi',
  other: {
    boat: '0.17.0',
  },
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${zen.variable} ${inter.variable} ${monospace.variable}`}>
      <body>
        <ThemeProviders>
          <OnchainProviders>
            <ClientProviders>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </ClientProviders>
          </OnchainProviders>
        </ThemeProviders>
      </body>
    </html>
  );
}
