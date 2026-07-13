"use client";

import { use } from "react";
import { useReadContract } from "wagmi";
import { formatEther } from "viem";
import { clearOddsCache } from "@/app/hooks/useOddsHistory";
import Link from "next/link";
import { BetPanel } from "./BetPanel";
import { ResolvePanel } from "./ResolvePanel";
import { OddsChart } from "./OddsChart";
import { ConnectWallet } from "@/app/components/ConnectWallet";
import { Ticker } from "@/app/components/Ticker";
import { useMarkets } from "@/app/hooks/useMarkets";
import { MARKET_ABI } from "@/app/config/contracts";
import { getYesPercent, getVolume, formatEndTime } from "@/app/lib/odds";

export default function MarketPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const marketAddress = address as `0x${string}`;

  const { markets } = useMarkets();

  const { data, isLoading, refetch } = useReadContract({
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: "getMarketInfo",
  });

  const info = data as
    | [string, bigint, boolean, boolean, bigint, bigint]
    | undefined;

  const question = info?.[0] ?? "";
  const endTime = info?.[1] ?? 0n;
  const resolved = info?.[2] ?? false;
  const outcome = info?.[3] ?? false;
  const totalYes = info?.[4] ?? 0n;
  const totalNo = info?.[5] ?? 0n;

  const yesPercent = getYesPercent(totalYes, totalNo);
  const volume = getVolume(totalYes, totalNo);

  // eslint-disable-next-line react-hooks/purity
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const ended = endTime > 0n && endTime <= nowSec;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Ticker markets={markets} />

      {/* Header */}
      <header className="border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-base font-semibold tracking-tight">
              Veil<span className="text-avax">cast</span>
            </Link>
            <div className="text-xs text-muted">
              <Link href="/" className="hover:text-dim transition-colors">
                Markets
              </Link>
              <span className="mx-2 text-border-strong">/</span>
              <span className="text-dim">Crypto</span>
            </div>
          </div>
          <ConnectWallet />
        </div>
      </header>

      {isLoading ? (
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="h-64 bg-surface rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px]">
          {/* ─── Left: question, stats, chart ─── */}
          <div className="px-6 py-6 lg:border-r border-border-subtle">
            {/* Meta row */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono-nums text-[10px] tracking-wider text-muted">
                CRYPTO
              </span>
              <span className="text-muted text-[10px]">·</span>
              <span className="font-mono-nums text-[10px] text-muted">
                {resolved
                  ? "SETTLED"
                  : ended
                  ? "AWAITING RESOLUTION"
                  : `ENDS ${formatEndTime(endTime).toUpperCase()}`}
              </span>
              {!resolved && !ended && (
                <span className="ml-auto font-mono-nums text-[10px] text-yes">
                  ● LIVE
                </span>
              )}
              {resolved && (
                <span className="ml-auto font-mono-nums text-[10px] text-yes">
                  {outcome ? "YES WON" : "NO WON"}
                </span>
              )}
            </div>

            {/* Question */}
            <h1 className="text-xl leading-snug mb-6">{question}</h1>

            {/* Stats row */}
            <div className="flex items-end gap-6 pb-5 mb-5 border-b border-border-subtle">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono-nums text-5xl font-semibold text-yes leading-none tracking-tight">
                    {yesPercent}
                  </span>
                  <span className="font-mono-nums text-lg text-yes">%</span>
                </div>
                <div className="font-mono-nums text-[10px] text-muted mt-1.5">
                  {resolved ? "FINAL" : "CHANCE YES"}
                </div>
              </div>

              <div className="border-l border-border-subtle pl-6">
                <div className="font-mono-nums text-lg text-dim">{volume}</div>
                <div className="font-mono-nums text-[10px] text-muted mt-1.5">
                  AVAX VOL
                </div>
              </div>

              <div className="border-l border-border-subtle pl-6">
                <div className="font-mono-nums text-lg text-dim">
                  {100 - yesPercent}¢
                </div>
                <div className="font-mono-nums text-[10px] text-muted mt-1.5">
                  NO PRICE
                </div>
              </div>
            </div>

            {/* Chart */}
            <OddsChart
              marketAddress={marketAddress}
              currentYesPercent={yesPercent}
            />

            {/* Market details */}
            <div className="mt-8 pt-6 border-t border-border-subtle">
              <div className="font-mono-nums text-[11px] tracking-wider text-muted mb-4">
                MARKET DETAILS
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-[13px]">
                <div className="flex justify-between border-b border-border-subtle pb-2">
                  <span className="text-muted">Yes pool</span>
                  <span className="font-mono-nums text-dim">
                    {Number(formatEther(totalYes)).toFixed(3)} AVAX
                  </span>
                </div>
                <div className="flex justify-between border-b border-border-subtle pb-2">
                  <span className="text-muted">No pool</span>
                  <span className="font-mono-nums text-dim">
                    {Number(formatEther(totalNo)).toFixed(3)} AVAX
                  </span>
                </div>
                <div className="flex justify-between border-b border-border-subtle pb-2">
                  <span className="text-muted">Resolution</span>
                  <span className="font-mono-nums text-dim">
                    {resolved ? (outcome ? "YES" : "NO") : "PENDING"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border-subtle pb-2">
                  <span className="text-muted">Settlement</span>
                  <span className="font-mono-nums text-dim">ON-CHAIN</span>
                </div>
                <div className="flex justify-between border-b border-border-subtle pb-2">
                  <span className="text-muted">Network</span>
                  <span className="font-mono-nums text-dim">AVALANCHE FUJI</span>
                </div>
                <div className="flex justify-between border-b border-border-subtle pb-2">
                  <span className="text-muted">Contract</span>
                  <a
                    href={"https://testnet.snowtrace.io/address/" + marketAddress}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono-nums text-avax hover:underline"
                  >
                    VIEW ON SNOWTRACE ↗
                  </a>
                </div>
              </div>
            </div>
          </div>


          {/* ─── Right: trade panel ─── */}
          <div>
            <BetPanel
              marketAddress={marketAddress}
              yesPercent={yesPercent}
              resolved={resolved}
              ended={ended}
              totalYes={totalYes}
              totalNo={totalNo}
              onBetPlaced={() => {
                clearOddsCache(marketAddress);
                refetch();
              }}
            />
            <ResolvePanel
              marketAddress={marketAddress}
              endTime={endTime}
              resolved={resolved}
              outcome={outcome}
              onUpdate={() => refetch()}
            />
          </div>
        </div>
      )}
    </main>
  );
}