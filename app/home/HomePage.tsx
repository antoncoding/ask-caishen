'use client';

import React from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Button } from '@/components/common/Button';
import Header from '@/components/layout/header/Header';

export default function HomePage() {
  const { address } = useAccount();

  return (
    <div className="bg-main flex min-h-screen flex-col">
      <Header ghost />
      <main className="container mx-auto flex flex-1 flex-col items-center justify-center">
        <section className="flex w-full flex-col items-center justify-center">
          <div className="w-full sm:w-4/5 md:w-3/5">
            <h1 className="mb-4 text-center font-zen text-4xl font-bold text-primary md:text-5xl">
              Ask Eve what to invest in DeFi
            </h1>
            <p className="mb-8 text-center text-xl text-secondary">
              AI-powered investment advice based on your on-chain portfolio
            </p>
          </div>
          <div className="mt-8 flex w-full justify-center gap-4 px-4 sm:w-auto sm:flex-row">
            <Link href="/info" className="block w-full sm:w-auto">
              <Button variant="default" className="w-full px-10 py-4 font-zen" size="lg">
                Learn More
              </Button>
            </Link>
            <Link href={`/portfolio/${address ?? ''}`} className="block w-full sm:w-auto">
              <Button variant="cta" className="w-full px-10 py-4 font-zen" size="lg">
                Get Started
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
