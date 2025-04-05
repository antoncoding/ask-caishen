'use client';

import { formatDistanceToNow } from 'date-fns';
import { 
  ArrowDownIcon, 
  ArrowUpIcon, 
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  CheckBadgeIcon,
  XCircleIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { Card, CardHeader } from 'app/components/ui/card';
import { useQuery } from '@tanstack/react-query';

interface HistoryItem {
  timeMs: number;
  type: number;
  direction: 'in' | 'out';
  details: {
    type: string;
    txHash: string;
    status: string;
    fromAddress: string;
    toAddress: string;
    tokenActions: Array<{
      standard: string;
      address: string;
      amount?: string;
      direction: string;
      priceToUsd?: number;
    }>;
  };
}

interface HistoryResponse {
  items: HistoryItem[];
  cache_counter: number;
}

async function getHistory(address: string | undefined) {
  if (!address) return null;
  const res = await fetch(`/api/portfolio/history?address=${address}&limit=20`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const getTransactionIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'transfer':
    case 'send':
      return <ArrowsRightLeftIcon className="h-4 w-4" />;
    case 'approve':
      return <CheckBadgeIcon className="h-4 w-4" />;
    case 'revoke':
      return <XCircleIcon className="h-4 w-4" />;
    case 'receive':
      return <BanknotesIcon className="h-4 w-4" />;
    default:
      return <QuestionMarkCircleIcon className="h-4 w-4" />;
  }
};

function TransactionCard({ item }: { item: HistoryItem }) {
  const date = new Date(item.timeMs);
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });
  
  return (
    <Card className="mb-2 hover:shadow-sm transition-shadow duration-200">
      <CardHeader className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-1.5 rounded-full ${item.direction === 'in' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
              {item.direction === 'in' ? (
                <ArrowDownIcon className="h-4 w-4 text-green-500 dark:text-green-400" />
              ) : (
                <ArrowUpIcon className="h-4 w-4 text-red-500 dark:text-red-400" />
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-gray-500 dark:text-gray-400">
                {getTransactionIcon(item.details.type)}
              </div>
              <div>
                <h3 className="text-sm text-gray-700 dark:text-gray-200 font-inter">{item.details.type}</h3>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-inter mt-0.5">
                  <span>From: {formatAddress(item.details.fromAddress)}</span>
                  <span className="mx-1.5">→</span>
                  <span>To: {formatAddress(item.details.toAddress)}</span>
                </div>
                {item.details.tokenActions.map((action, index) => (
                  <div key={index} className="text-xs text-gray-600 dark:text-gray-400 font-inter mt-0.5">
                    {action.amount && (
                      <span>
                        Amount: {parseFloat(action.amount).toFixed(4)} {action.standard}
                        {action.priceToUsd && ` ($${action.priceToUsd.toFixed(2)})`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-inter">{timeAgo}</div>
            <a 
              href={`https://etherscan.io/tx/${item.details.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 mt-1"
              title="View on Etherscan"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function HistoryList({ address }: { address: Address | undefined }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['history', address],
    queryFn: () => getHistory(address),
    enabled: !!address
  });

  if (!address) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">Please connect your wallet to view transaction history</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">Loading transaction history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-red-500 dark:text-red-400 font-inter">Error loading transaction history</p>
      </div>
    );
  }

  if (!data?.items?.length) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">No transactions found</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      {data.items.map((item: HistoryItem) => (
        <TransactionCard key={item.details.txHash} item={item} />
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const { address } = useAccount();
  
  return (
    <div className="max-w-4xl mx-auto px-8 py-6">
      <p className="text-2xl text-gray-700 dark:text-gray-200 mb-6 font-inter">Transaction History</p>
      <HistoryList address={address} />
    </div>
  );
} 