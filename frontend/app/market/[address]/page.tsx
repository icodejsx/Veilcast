"use client";

import { use } from "react";
import { useReadContract } from "wagmi";
import { BetPanel } from "./BetPanel";
import Link from "next/link";
import { ConnectWallet } from "@/app/components/ConnectWallet";
import { MARKET_ABI } from "@/app/config/contracts";
import { getYesPercent, formatEndTime } from "@/app/lib/odds";

export default function MarketPage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = use(params);
  const marketAddress = address as `0x${string}`;

  const { data, isLoading, refetch } = useReadContract({
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: "getMarketInfo",
  });

  const info = data as
    | [string, bigint, boolean, boolean, bigint, bigint]
    | undefined;

  const question = info?.[0] ?? "Loading…";
  const endTime = info?.[1] ?? 0n;
  const resolved = info?.[2] ?? false;
  const totalYes = info?.[4] ?? 0n;
  const totalNo = info?.[5] ?? 0n;

  const yesPercent = getYesPercent(totalYes, totalNo);

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "white" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #1a1a1a" }}>
        <Link href="/" style={{ fontSize: "22px", fontWeight: 600, textDecoration: "none", color: "white" }}>
          Veil<span style={{ color: "#E84142" }}>cast</span>
        </Link>
        <ConnectWallet />
      </header>

      {isLoading ? (
        <p style={{ color: "#666", padding: "32px" }}>Loading market…</p>
      ) : (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "24px" }}>
          <div>
            <Link href="/" style={{ fontSize: "13px", color: "#888", textDecoration: "none" }}>
              ← Back to markets
            </Link>
            <div style={{ fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", margin: "16px 0 8px" }}>
              Crypto
            </div>
            <h1 style={{ fontSize: "26px", fontWeight: 600, lineHeight: 1.3, marginBottom: "24px" }}>
              {question}
            </h1>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "44px", fontWeight: 600, color: "#1D9E75" }}>{yesPercent}%</span>
              <span style={{ fontSize: "15px", color: "#888" }}>chance YES</span>
            </div>
            <div style={{ height: "220px", background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: "#444", fontSize: "13px" }}>
              Odds chart appears once betting begins
            </div>
          </div>

          <BetPanel
            marketAddress={marketAddress}
            yesPercent={yesPercent}
            resolved={resolved}
            onBetPlaced={() => refetch()}
          />
        </div>
      )}
    </main>
  );
}
