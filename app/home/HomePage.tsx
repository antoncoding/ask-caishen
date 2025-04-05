'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/common/Button';

export default function HomePage() {
  return (
    <div className="bg-main flex min-h-screen flex-col items-center justify-center">
      <main className="w-full max-w-4xl px-4 text-center">
        <section className="flex w-full flex-col items-center justify-center">
          <div className="w-full sm:w-4/5 md:w-3/5 mx-auto">
            <h1 className="mb-4 text-center font-zen text-5xl text-primary md:text-6xl">
              Ask Eve what to invest in DeFi
            </h1>
            <p className="mb-10 text-center text-xl text-secondary">
              AI-powered investment advice based on your on-chain portfolio
            </p>
          </div>
          
          <Link href="/portfolio" className="block w-full max-w-xs mx-auto">
            <Button variant="cta" className="w-full px-16 py-5 text-xl font-zen" size="lg">
              Get Started
            </Button>
          </Link>
        </section>
      </main>
    </div>
  );
}
