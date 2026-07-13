"use client";

import Link from "next/link";
import { Sparkline } from "./Sparkline";
import type { MarketData } from "@/app/hooks/useMarkets";
import { getYesPercent, getVolume, formatEndTime } from "@/app/lib/odds";

export function MarketRow({ market }: { market: MarketData }) {
  const yesPercent = getYesPercent(market.totalYes, market.totalNo);
  const noPercent = 100 - yesPercent;
  const volume = getVolume(market.totalYes, market.totalNo);

  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const ended = market.endTime <= nowSec;

  return (
    <Link href={`/market/${market.address}`} className="block group">
      <div
        className={`
          grid grid-cols-[1fr_100px_120px_110px] gap-4 items-center
          py-4 border-b border-border-subtle
          hover:bg-surface transition-colors px-2 -mx-2 rounded-lg
          ${market.resolved ? "opacity-50" : ""}
        `}
      >
        {/* Question + meta */}
        <div>
          <div className="text-sm text-foreground mb-1 group-hover:text-white transition-colors">
            {market.question}
          </div>
          <div className="font-mono-nums text-[10px] text-muted tracking-wide">
            CRYPTO ·{" "}
            {market.resolved
              ? "SETTLED"
              : ended
              ? "AWAITING RESOLUTION"
              : `ENDS ${formatEndTime(market.endTime).toUpperCase()}`}
          </div>
        </div>

        {/* Sparkline */}
        <Sparkline
          marketAddress={market.address}
          currentYesPercent={yesPercent}
        />

        {/* Odds + volume */}
        <div className="text-right">
          <div className="font-mono-nums text-lg text-yes">{yesPercent}%</div>
          <div className="font-mono-nums text-[10px] text-muted">
            {volume} AVAX
          </div>
        </div>

        {/* Actions */}
        {market.resolved ? (
          <div className="font-mono-nums text-center text-[10px] text-muted border border-border-subtle py-1.5 rounded">
            {market.outcome ? "YES WON" : "NO WON"}
          </div>
        ) : (
          <div className="flex gap-1">
            <div className="flex-1 text-center py-1.5 text-[10px] rounded bg-yes-bg border border-yes/25 text-yes">
              {yesPercent}¢
            </div>
            <div className="flex-1 text-center py-1.5 text-[10px] rounded border border-border-strong text-no">
              {noPercent}¢
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}