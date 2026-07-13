"use client";

import { formatEther } from "viem";
import type { MarketData } from "./useMarkets";

export function useStats(markets: MarketData[]) {
  let totalVolume = 0n;
  let liveCount = 0;

  const nowSec = BigInt(Math.floor(Date.now() / 1000));

  for (const m of markets) {
    totalVolume += m.totalYes + m.totalNo;
    if (!m.resolved && m.endTime > nowSec) liveCount++;
  }

  return {
    totalVolume: Number(formatEther(totalVolume)).toFixed(2),
    liveCount,
    totalCount: markets.length,
  };
}