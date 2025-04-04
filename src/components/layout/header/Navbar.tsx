'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { FaRegMoon } from 'react-icons/fa';
import { LuSunMedium } from 'react-icons/lu';
import { RiHistoryLine } from 'react-icons/ri';
import { BsCircle } from 'react-icons/bs';

export function NavbarLink({
  children,
  href,
  matchKey,
  target,
}: {
  children: React.ReactNode;
  href: string;
  matchKey?: string;
  target?: string;
}) {
  const pathname = usePathname();
  const isActive = matchKey ? pathname.includes(matchKey) : pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        'px-2 py-1 text-center font-zen text-base font-normal text-primary no-underline',
        'relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-primary',
        'no-underline transition-all duration-200',
        isActive ? 'after:opacity-100' : 'after:opacity-0',
      )}
      target={target}
    >
      {children}
    </Link>
  );
}

export function NavbarTitle() {
  return (
    <div className="flex h-8 items-center justify-start gap-2">
      <div className="flex">
        <BsCircle className="h-5 w-5 text-blue-500" />
        <BsCircle className="h-5 w-5 -ml-2 text-green-500" />
        <BsCircle className="h-5 w-5 -ml-2 text-purple-500" />
      </div>
      <Link
        href="/"
        passHref
        className="text-center font-zen text-lg font-medium text-primary no-underline"
        aria-label="Eve homepage"
      >
        Eve
      </Link>
    </div>
  );
}

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex flex-col h-full justify-between">
      <nav className="flex h-full w-full items-center gap-8 px-4">
        <NavbarTitle />

        <div className="flex items-center gap-4">
          <NavbarLink href="/">Home</NavbarLink>
          <NavbarLink href="/history">
            <div className="flex items-center gap-1">
              <RiHistoryLine className="h-4 w-4" />
              History
            </div>
          </NavbarLink>
        </div>
      </nav>
      
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed bottom-6 left-6 rounded-full bg-surface p-3 shadow-md"
        aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {mounted && (theme === 'dark' ? 
          <LuSunMedium className="h-5 w-5 text-primary" /> : 
          <FaRegMoon className="h-5 w-5 text-primary" />
        )}
      </button>
    </div>
  );
}

export default Navbar;
