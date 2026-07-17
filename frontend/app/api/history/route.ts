import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem, formatEther } from "viem";
import { avalancheFuji } from "viem/chains";
import { FACTORY_ADDRESS, FACTORY_ABI } from "@/app/config/contracts";

// Server-side RPC — key stays on the server, never sent to the browser
const RPC_URL =
  process.env.RPC_URL ||
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://api.avax-test.network/ext/bc/C/rpc";

const client = createPublicClient({
  chain: avalancheFuji,
  transport: http(RPC_URL),
});

const BET_EVENT = parseAbiItem(
  "event BetPlaced(address indexed user, bool isYes, uint256 amount)"
);

interface OddsPoint {
  t: number; // trade index
  yes: number;
}

// In-memory cache — one scan shared across all requests
let cache: { data: Record<string, OddsPoint[]>; ts: number } | null = null;
const CACHE_MS = 30_000; // 30 seconds

export async function GET() {
  try {
    // Serve from cache if fresh
    if (cache && Date.now() - cache.ts < CACHE_MS) {
      return NextResponse.json(cache.data);
    }

    // 1. Get all market addresses from the factory
    const addresses = (await client.readContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "getAllMarkets",
    })) as `0x${string}`[];

    const latestBlock = await client.getBlockNumber();
    const CHUNK = 2048n;
    const MAX_LOOKBACK = 100000n;
    const startBlock =
      latestBlock > MAX_LOOKBACK ? latestBlock - MAX_LOOKBACK : 0n;

    const result: Record<string, OddsPoint[]> = {};

    // 2. For each market, fetch its BetPlaced events
    for (const market of addresses) {
      const logs = [];
      for (let from = startBlock; from <= latestBlock; from += CHUNK) {
        let to = from + CHUNK - 1n;
        if (to > latestBlock) to = latestBlock;
        const chunk = await client.getLogs({
          address: market,
          event: BET_EVENT,
          fromBlock: from,
          toBlock: to,
        });
        logs.push(...chunk);
      }

      // 3. Replay bets → running odds
      let yes = 0;
      let no = 0;
      const points: OddsPoint[] = [];
      logs.forEach((log, i) => {
        const isYes = log.args.isYes as boolean;
        const amount = Number(formatEther(log.args.amount as bigint));
        if (isYes) yes += amount;
        else no += amount;
        const total = yes + no;
        points.push({ t: i + 1, yes: total === 0 ? 50 : Math.round((yes / total) * 100) });
      });

      result[market.toLowerCase()] = points;
    }

    cache = { data: result, ts: Date.now() };
    return NextResponse.json(result);
  } catch (err) {
    console.error("History API error:", err);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}