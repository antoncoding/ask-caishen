import { useState, useEffect } from 'react';

interface Portfolio {
  // Add your portfolio type definition here
  [key: string]: any;
}

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    // Get portfolio from localStorage
    const storedPortfolio = localStorage.getItem('portfolioContext');
    if (storedPortfolio) {
      try {
        setPortfolio(JSON.parse(storedPortfolio));
      } catch (error) {
        console.error('Error parsing portfolio:', error);
      }
    }
  }, []);

  return { portfolio };
} 