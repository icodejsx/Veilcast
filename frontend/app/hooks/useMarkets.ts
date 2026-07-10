"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI, MARKET_ABI } from "@/app/config/contracts";

export interface MarketData {
  address: `0x${string}`;
  question: string;
  endTime: bigint;
  resolved: boolean;
  outcome: boolean;
  totalYes: bigint;
  totalNo: bigint;
}

export function useMarkets() {
  // Step 1: get all market addresses from the factory
  const { data: addresses, isLoading: loadingAddresses } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getAllMarkets",
  });

  const marketAddresses = (addresses as `0x${string}`[]) || [];

  // Step 2: for each address, call getMarketInfo()
  const { data: marketInfos, isLoading: loadingInfos } = useReadContracts({
    contracts: marketAddresses.map((addr) => ({
      address: addr,
      abi: MARKET_ABI,
      functionName: "getMarketInfo",
    })),
    query: { enabled: marketAddresses.length > 0 },
  });

  // Step 3: combine addresses + their info into clean objects
  const markets: MarketData[] = marketAddresses.map((addr, i) => {
    const info = marketInfos?.[i]?.result as
      | [string, bigint, boolean, boolean, bigint, bigint]
      | undefined;

    return {
      address: addr,
      question: info?.[0] ?? "Loading...",
      endTime: info?.[1] ?? 0n,
      resolved: info?.[2] ?? false,
      outcome: info?.[3] ?? false,
      totalYes: info?.[4] ?? 0n,
      totalNo: info?.[5] ?? 0n,
    };
  });

  return {
    markets,
    isLoading: loadingAddresses || loadingInfos,
  };
}