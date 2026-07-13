"use client";

import type { MarketData } from "@/app/hooks/useMarkets";
import { formatEther } from "viem";

export function Ticker({ markets }: { markets: MarketData[] }) {
  let totalVolume = 0n;
  let liveCount = 0;
  const nowSec = BigInt(Math.floor(Date.now() / 1000));

  for (const m of markets) {
    totalVolume += m.totalYes + m.totalNo;
    if (!m.resolved && m.endTime > nowSec) liveCount++;
  }

  const vol = Number(formatEther(totalVolume)).toFixed(2);

  const items = [
    { label: "TOTAL VOL", value: `${vol} AVAX`, color: "text-foreground" },
    { label: "LIVE", value: `${liveCount} MARKETS`, color: "text-foreground" },
    { label: "MARKETS", value: `${markets.length} TOTAL`, color: "text-foreground" },
    { label: "NETWORK", value: "● FUJI", color: "text-yes" },
    { label: "SETTLEMENT", value: "ON-CHAIN", color: "text-foreground" },
  ];

  // Duplicate for seamless loop
  const loop = [...items, ...items];

  return (
    <div className="bg-surface border-b border-border-subtle py-2 overflow-hidden whitespace-nowrap">
      <div className="inline-flex gap-8 animate-ticker font-mono-nums text-[11px]">
        {loop.map((item, i) => (
          <span key={i} className="text-muted">
            {item.label}{" "}
            <span className={item.color}>{item.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}