import { NextRequest, NextResponse } from 'next/server';

const INCH_API_KEY = process.env.ONEINCHE_KEY;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const address = searchParams.get('address');
  const chainId = searchParams.get('chainId') || '1';
  const limit = searchParams.get('limit') || '20';

  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' },
      { status: 400 }
    );
  }

  const url = new URL(`https://api.1inch.dev/history/v2.0/history/${address}/events`);
  url.searchParams.append('chainId', chainId);
  url.searchParams.append('limit', limit);

  try {
    const response = await fetch(
      url,
      {
        headers: {
          'Authorization': `Bearer ${INCH_API_KEY}`
        },
        method: 'GET',
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
} 