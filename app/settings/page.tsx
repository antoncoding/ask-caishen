'use client';

import { Switch } from '@nextui-org/react';
import Header from '@/components/layout/header/Header';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function SettingsPage() {
  const [usePermit2, setUsePermit2] = useLocalStorage('usePermit2', true);
  const [includeUnknownTokens, setIncludeUnknownTokens] = useLocalStorage(
    'includeUnknownTokens',
    false,
  );
  const [includeExperimentalProtocols, setIncludeExperimentalProtocols] = useLocalStorage(
    'includeExperimentalProtocols',
    false,
  );
  const [enableAdvancedAnalysis, setEnableAdvancedAnalysis] = useLocalStorage(
    'enableAdvancedAnalysis',
    true,
  );

  return (
    <div className="flex w-full flex-col justify-between font-zen">
      <Header />
      <div className="container h-full gap-8 px-[5%]">
        <h1 className="py-8 font-zen">Settings</h1>

        <div className="flex flex-col gap-6">
          {/* AI Analysis Settings Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text font-monospace text-secondary">AI Analysis Settings</h2>

            <div className="bg-surface rounded p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium text-primary">Enable Advanced Analysis</h3>
                  <p className="text-sm text-secondary">
                    Allow Vennett to perform detailed analysis of your portfolio and on-chain activity to provide better recommendations.
                  </p>
                  <p className="mt-2 text-xs text-secondary opacity-80">
                    This includes historical performance, risk patterns, and cross-protocol exposure analysis.
                  </p>
                </div>
                <Switch
                  defaultSelected={enableAdvancedAnalysis}
                  onValueChange={setEnableAdvancedAnalysis}
                  size="sm"
                  color="primary"
                  className="min-w-[64px]"
                />
              </div>
            </div>
          </div>

          {/* Filter Settings Section */}
          <div className="flex flex-col gap-4 pt-4">
            <h2 className="text font-monospace text-secondary">Filter Settings</h2>

            <div className="bg-surface flex flex-col gap-6 rounded p-6">
              {/* Group related settings with a subtle separator */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium text-primary">Show Unknown Tokens</h3>
                  <p className="text-sm text-secondary">
                    Display tokens that aren't in our recognized token list. These will appear with
                    a question mark icon.
                  </p>
                  <p className="mt-2 text-xs text-secondary opacity-80">
                    Warning: Unknown tokens should be approached with caution as they haven't been
                    verified.
                  </p>
                </div>
                <Switch
                  defaultSelected={includeUnknownTokens}
                  onValueChange={setIncludeUnknownTokens}
                  size="sm"
                  color="primary"
                  className="min-w-[64px]"
                />
              </div>

              <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium text-primary">Include Experimental Protocols</h3>
                  <p className="text-sm text-secondary">
                    Allow Vennett to recommend investment opportunities in newer, experimental DeFi protocols.
                  </p>
                  <p className="mt-2 text-xs text-secondary opacity-80">
                    Warning: Experimental protocols typically carry higher risk but may offer higher returns.
                  </p>
                </div>
                <Switch
                  defaultSelected={includeExperimentalProtocols}
                  onValueChange={setIncludeExperimentalProtocols}
                  size="sm"
                  color="primary"
                  className="min-w-[64px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
