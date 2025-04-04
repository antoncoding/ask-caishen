import type { Metadata } from 'next';

interface MetadataProps {
  title: string;
  description: string;
  images?: string;
  pathname: string;
}

export function generateMetadata({
  title,
  description,
  images,
  pathname,
}: MetadataProps): Metadata {
  // Base URL for production - adjust as needed for your domain
  const baseUrl = 'https://eve.finance';
  
  // Determine full URL for canonical link and OG image
  const url = `${baseUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  
  // Default image path
  const imagePath = images ? `/images/${images}` : '/images/og-image.png';
  const imageUrl = `${baseUrl}${imagePath}`;

  return {
    title,
    description,
    metadataBase: new URL(baseUrl),
    authors: [{ name: 'Eve Finance' }],
    openGraph: {
      title,
      description,
      url,
      siteName: 'Eve Finance',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@EveDeFi',
    },
    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },
    alternates: {
      canonical: url,
    },
  };
} 