"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useMarkets } from "@/app/hooks/useMarkets";
import { getYesPercent, getVolume, formatEndTime } from "@/app/lib/odds";

export default function Home() {
  const { markets, isLoading } = useMarkets();

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "white" }}>
      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #1a1a1a" }}>
        <div style={{ fontSize: "22px", fontWeight: 600 }}>
          Veil<span style={{ color: "#E84142" }}>cast</span>
        </div>
        <ConnectButton />
      </header>

      {/* Hero */}
      <section style={{ padding: "48px 32px 24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 600, marginBottom: "8px" }}>
          Prediction Markets
        </h1>
        <p style={{ color: "#888" }}>
          Bet on the future. Powered by Avalanche.
        </p>
      </section>

      {/* Markets grid */}
      <section style={{ padding: "0 32px 48px" }}>
        {isLoading ? (
          <p style={{ color: "#666" }}>Loading markets…</p>
        ) : markets.length === 0 ? (
          <p style={{ color: "#666" }}>No markets yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
            {markets.map((market) => {
              const yesPercent = getYesPercent(market.totalYes, market.totalNo);
              return (
                <Link
                  key={market.address}
                  href={`/market/${market.address}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div style={{ background: "#141414", border: "1px solid #222", borderRadius: "16px", padding: "20px", cursor: "pointer", transition: "border-color 0.2s" }}>
                    <div style={{ fontSize: "12px", color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
                      Crypto
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: 500, marginBottom: "20px", lineHeight: 1.4, minHeight: "48px" }}>
                      {market.question}
                    </div>

                    {/* Odds bar */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "28px", fontWeight: 600, color: "#1D9E75" }}>
                        {yesPercent}%
                      </span>
                      <span style={{ fontSize: "13px", color: "#888" }}>YES</span>
                    </div>
                    <div style={{ height: "6px", background: "#222", borderRadius: "3px", overflow: "hidden", marginBottom: "16px" }}>
                      <div style={{ width: `${yesPercent}%`, height: "100%", background: "#1D9E75" }} />
                    </div>

                    {/* Footer stats */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666" }}>
                      <span>{getVolume(market.totalYes, market.totalNo)} AVAX Vol</span>
                      <span>{market.resolved ? "Resolved" : `Ends ${formatEndTime(market.endTime)}`}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}