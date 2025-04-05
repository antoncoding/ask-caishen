'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { FaRegMoon } from 'react-icons/fa';
import { LuSunMedium } from 'react-icons/lu';
import { RiHistoryLine, RiHome4Line } from 'react-icons/ri';
import { BsCircle } from 'react-icons/bs';

export function IconNavLink({
  href,
  matchKey,
  icon,
  label,
}: {
  href: string;
  matchKey?: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = matchKey ? pathname.includes(matchKey) : pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        'flex flex-col items-center justify-center p-3 my-2 text-primary rounded-full',
        'transition-all duration-200 hover:bg-surface',
        isActive ? 'bg-surface' : ''
      )}
      aria-label={label}
    >
      {icon}
    </Link>
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
    <div className="fixed left-0 top-0 bottom-0 w-16 flex flex-col items-center justify-between py-6 bg-main">
      {/* Top - Logo */}
      <div />
      
      {/* Middle - Navigation */}
      <div className="flex flex-col items-center">
        <IconNavLink 
          href="/" 
          icon={<RiHome4Line className="h-6 w-6" />} 
          label="Home" 
        />
        <IconNavLink 
          href="/portfolio/history" 
          icon={<RiHistoryLine className="h-6 w-6" />} 
          label="History" 
        />
      </div>
      
      {/* Bottom - Theme Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-full bg-surface p-3"
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
