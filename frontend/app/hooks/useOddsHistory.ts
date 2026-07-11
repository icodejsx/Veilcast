"use client";

import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { formatEther, parseAbiItem } from "viem";

export interface OddsPoint {
  time: number;      // unix seconds
  yesPercent: number;
}

export function useOddsHistory(marketAddress: `0x${string}`) {
  const publicClient = usePublicClient();
  const [points, setPoints] = useState<OddsPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (!publicClient) return;
    const client = publicClient;
    async function fetchHistory() {
      try {
        // Grab every BetPlaced event this market ever emitted
      // Avalanche RPC caps getLogs at 2048 blocks per call.
        // Scan recent blocks in chunks back to the market's likely deployment.
        const latestBlock = await client.getBlockNumber();
        const CHUNK = 2000n;
        const MAX_LOOKBACK = 100000n; // ~how far back to search
        const startBlock = latestBlock > MAX_LOOKBACK ? latestBlock - MAX_LOOKBACK : 0n;

        const logs = [];
        for (let from = startBlock; from <= latestBlock; from += CHUNK) {
          let to = from + CHUNK - 1n;
          if (to > latestBlock) to = latestBlock;
          const chunkLogs = await client.getLogs({
            address: marketAddress,
            event: parseAbiItem(
              "event BetPlaced(address indexed user, bool isYes, uint256 amount)"
            ),
            fromBlock: from,
            toBlock: to,
          });
          logs.push(...chunkLogs);
        }

        // Replay them in order, tracking running totals
        let runningYes = 0;
        let runningNo = 0;
        const history: OddsPoint[] = [];

        for (const log of logs) {
          const isYes = log.args.isYes as boolean;
          const amount = Number(formatEther(log.args.amount as bigint));

          if (isYes) runningYes += amount;
          else runningNo += amount;

          const total = runningYes + runningNo;
          const yesPercent = total === 0 ? 50 : Math.round((runningYes / total) * 100);

          // Get the block's timestamp for the x-axis
const block = await client.getBlock({ blockNumber: log.blockNumber });
          history.push({ time: Number(block.timestamp), yesPercent });
        }

        setPoints(history);
      } catch (err) {
        console.error("Failed to fetch odds history:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [publicClient, marketAddress]);

  return { points, isLoading };
}