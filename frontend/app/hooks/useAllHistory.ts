"use client";

import { useEffect, useState } from "react";

export interface OddsPoint {
  t: number;
  yes: number;
}

// Module-level cache so all cards share one fetch
let globalData: Record<string, OddsPoint[]> | null = null;
let fetchPromise: Promise<Record<string, OddsPoint[]>> | null = null;

async function fetchAll(): Promise<Record<string, OddsPoint[]>> {
  if (globalData) return globalData;
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch("/api/history")
    .then((r) => r.json())
    .then((data) => {
      globalData = data;
      return data;
    });

  return fetchPromise;
}

// Hook for a single market's history
export function useMarketHistory(marketAddress: string) {
  const [points, setPoints] = useState<OddsPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAll()
      .then((data) => {
        if (!active) return;
        setPoints(data[marketAddress.toLowerCase()] || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [marketAddress]);

  return { points, isLoading };
}