import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const chainId = searchParams.get('chain_id') || '1'; // Default to Ethereum mainnet
  const timerange = searchParams.get('timerange') || '1week'; // Default to 1 week
  const useCache = searchParams.get('use_cache') || 'true';

  try {
    const url = 'https://api.1inch.dev/portfolio/portfolio/v4/general/profit_and_loss';
    
    const config = {
      headers: {
        'Authorization': 'Bearer PORsa7U14EGXJklJqyRHtPQ0ZUJ09y3p'
      },
      params: {
        'chain_id': chainId,
        'timerange': timerange,
        'use_cache': useCache
      }
    };

    const response = await axios.get(url, config);
    
    // Return only the result data
    return NextResponse.json(response.data.result);
  } catch (error: any) {
    console.error('Error fetching profit and loss data:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch profit and loss data' },
      { status: error.response?.status || 500 }
    );
  }
} 