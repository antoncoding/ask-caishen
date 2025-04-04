import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Address } from 'viem';

type AvatarProps = {
  address: Address;
  size?: number;
  rounded?: boolean;
};

export function Avatar({ address, size = 30, rounded = true }: AvatarProps) {
  const [useEffigy, setUseEffigy] = useState(true);
  const effigyUrl = `https://effigy.im/a/${address}.svg`;
  const dicebearUrl = `https://api.dicebear.com/7.x/pixel-art/png?seed=${address}`;

  return (
    <div style={{ width: size, height: size }}>
      <Image
        src={useEffigy ? effigyUrl : dicebearUrl}
        alt={`Avatar for ${address}`}
        width={size}
        height={size}
        style={{ borderRadius: rounded ? '50%' : '5px' }}
        onError={() => setUseEffigy(false)}
      />
    </div>
  );
}
