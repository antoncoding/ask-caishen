import { Address } from 'viem';
import { Avatar } from '@/components/Avatar/Avatar';

type AccountWithAvatarProps = {
  address: Address;
};

function AccountWithSmallAvatar({ address }: AccountWithAvatarProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <Avatar address={address as `0x${string}`} size={16} />
      <span className="font-inter text-sm font-medium text-primary">
        {address}
      </span>
    </div>
  );
}

export default AccountWithSmallAvatar;
