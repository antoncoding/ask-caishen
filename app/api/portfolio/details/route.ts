import { NextRequest, NextResponse } from 'next/server';

const INCH_API_KEY = process.env.ONEINCHE_KEY;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const address = searchParams.get('address');
  const chainId = searchParams.get('chainId') || '1';

  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' },
      { status: 400 }
    );
  }

  const url = new URL('https://api.1inch.dev/portfolio/portfolio/v4/overview/protocols/details');
  url.searchParams.append('addresses', address);
  url.searchParams.append('chain_id', chainId);
  url.searchParams.append('closed', 'true');
  url.searchParams.append('closed_threshold', '1');
  url.searchParams.append('use_cache', 'false');

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
    console.error('Failed to fetch portfolio details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio details' },
      { status: 500 }
    );
  }
} 