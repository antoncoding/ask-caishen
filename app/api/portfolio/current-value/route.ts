import { NextRequest, NextResponse } from 'next/server';

const INCH_API_KEY = process.env.ONEINCHE_KEY;

console.log('INCH_API_KEY', INCH_API_KEY);

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

  const url = `https://api.1inch.dev/portfolio/portfolio/v4/general/current_value?chain_id=${chainId}&addresses=${address}`;
  console.log('Calling URL:', url);

  try {
    const response = await fetch(
      url,
      {
        headers: {
          'Authorization': `Bearer ${INCH_API_KEY}`
        }
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
    return NextResponse.json(data.result);
  } catch (error) {
    console.error('Failed to fetch portfolio value:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio value' },
      { status: 500 }
    );
  }
} 