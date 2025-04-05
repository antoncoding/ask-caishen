import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const chainId = searchParams.get('chain_id') || '1'; // Default to Ethereum mainnet
  const timerange = searchParams.get('timerange') || '1week'; // Default to 1 week
  const useCache = searchParams.get('use_cache') || 'true';
  const addresses = searchParams.getAll('address'); // Get all address parameters

  try {
    const url = 'https://api.1inch.dev/portfolio/portfolio/v4/general/value_chart';
    
    const config = {
      headers: {
        'Authorization': 'Bearer PORsa7U14EGXJklJqyRHtPQ0ZUJ09y3p'
      },
      params: {
        'addresses': addresses.length > 0 ? addresses : undefined,
        'chain_id': chainId,
        'timerange': timerange,
        'use_cache': useCache
      },
      paramsSerializer: {
        indexes: null
      }
    };

    const response = await axios.get(url, config);
    
    // Return simplified data for charting
    return NextResponse.json({
      chart_data: response.data.result,
      timerange: timerange
    });
  } catch (error: any) {
    console.error('Error fetching value chart data:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch value chart data' },
      { status: error.response?.status || 500 }
    );
  }
} 