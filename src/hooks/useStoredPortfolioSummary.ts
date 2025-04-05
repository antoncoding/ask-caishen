import { useState, useEffect } from 'react';

export function useStoredPortfolioSummary() {
  const [portfolioSummary, setPortfolioSummary] = useState<string | null>(null);

  useEffect(() => {
    // Get portfolio from localStorage
    const storedPortfolio = localStorage.getItem('portfolioContext');
    if (storedPortfolio) {
      try {
        setPortfolioSummary(storedPortfolio);
      } catch (error) {
        console.error('Error parsing portfolio:', error);
      }
    }
  }, []);

  return { portfolioSummary };
} 