import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const chainId = searchParams.get('chain_id') || '1'; // Default to Ethereum mainnet
  const useCache = searchParams.get('use_cache') || 'true';

  try {
    const url = 'https://api.1inch.dev/portfolio/portfolio/v4/overview/protocols/current_value';
    
    const config = {
      headers: {
        'Authorization': 'Bearer PORsa7U14EGXJklJqyRHtPQ0ZUJ09y3p'
      },
      params: {
        'chain_id': chainId,
        'use_cache': useCache
      }
    };

    const response = await axios.get(url, config);
    
    // Extract just the data we need
    const result = response.data.result;
    
    // Calculate total USD value across all addresses
    const totalValueUsd = result.reduce((sum: number, item: any) => sum + item.value_usd, 0);
    
    return NextResponse.json({ 
      value_usd: totalValueUsd,
      addresses: result 
    });
  } catch (error: any) {
    console.error('Error fetching portfolio value:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio value' },
      { status: error.response?.status || 500 }
    );
  }
} 