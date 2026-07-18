"use client";

import Link from "next/link";
import { Sparkline } from "./Sparkline";

import type { MarketData } from "@/app/hooks/useMarkets";
import { getYesPercent, getVolume, formatEndTime } from "@/app/lib/odds";
import { inferCategory } from "@/app/lib/category";

export function MarketCard({ market }: { market: MarketData }) {
  const yesPercent = getYesPercent(market.totalYes, market.totalNo);
  const noPercent = 100 - yesPercent;
  const volume = getVolume(market.totalYes, market.totalNo);

  // eslint-disable-next-line react-hooks/puritynn
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const ended = market.endTime <= nowSec;
  const category = inferCategory(market.question);

  return (
    <Link href={`/market/${market.address}`} className="block group h-full">
      <div
        className={`
          bg-surface border border-border-subtle rounded-xl p-4 h-full flex flex-col
          transition-all duration-200 hover:border-border-strong
          ${market.resolved ? "opacity-60" : ""}
        `}
      >
        <div className="font-mono-nums text-[9px] text-muted mb-2 tracking-wide">
          {category.toUpperCase()}
        </div>

        <div className="text-[13px] leading-snug text-foreground mb-3 min-h-[36px] group-hover:text-white transition-colors">
          {market.question}
        </div>

        <div className="mb-2.5">
          <Sparkline
            marketAddress={market.address}
            currentYesPercent={yesPercent}
          /> 
        </div>

        <div className="flex items-baseline justify-between mb-2.5">
          <span className="font-mono-nums text-xl text-yes leading-none">
            {yesPercent}%
          </span>
          <span className="font-mono-nums text-[9px] text-muted">
            {volume} AVAX
          </span>
        </div>

        {market.resolved ? (
          <div className="font-mono-nums text-center py-1.5 text-[10px] text-yes bg-yes-bg border border-yes/20 rounded-lg">
            {market.outcome ? "YES WON" : "NO WON"}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            <div className="text-center py-1.5 text-[10px] rounded-lg bg-yes-bg border border-yes/25 text-yes">
              {yesPercent}¢
            </div>
            <div className="text-center py-1.5 text-[10px] rounded-lg border border-border-strong text-no">
              {noPercent}¢
            </div>
          </div>
        )}

        <div className="mt-auto pt-2.5 font-mono-nums text-[9px] text-muted">
          {market.resolved
            ? "SETTLED"
            : ended
            ? "AWAITING RESOLUTION"
            : `ENDS ${formatEndTime(market.endTime).toUpperCase()}`}
        </div>
      </div>
    </Link>
  );
}