"use client";

import { useState } from "react";
import Link from "next/link";

import { ConnectWallet } from "@/app/components/ConnectWallet";
import { Ticker } from "@/app/components/Ticker";
import { FeaturedMarket } from "@/app/components/FeaturedMarket";
import { MarketRow } from "@/app/components/MarketRow";
import { useMarkets } from "@/app/hooks/useMarkets";
import { MarketCard } from "./components/MarketCard";

const FILTERS = ["All", "Crypto", "Sports", "Resolved"];

export default function Home() {
  const { markets, isLoading } = useMarkets();
  const [filter, setFilter] = useState("All");

  // Pick the featured market: highest volume, not resolved
  // eslint-disable-next-line react-hooks/purity
  const nowSec = BigInt(Math.floor(Date.now() / 1000));
  const liveMarkets = markets.filter((m) => !m.resolved && m.endTime > nowSec);

  const featured =
    liveMarkets.length > 0
      ? liveMarkets.reduce((best, m) =>
          m.totalYes + m.totalNo > best.totalYes + best.totalNo ? m : best
        )
      : markets[0];

  // The rest go in the list (exclude the featured one)
  const rest = markets.filter((m) => m.address !== featured?.address);

  const filtered =
    filter === "Resolved"
      ? rest.filter((m) => m.resolved)
      : rest.filter((m) => !m.resolved);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ─── Ticker ─── */}
      <Ticker markets={markets} />

      {/* ─── Header ─── */}
      <header className="border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-7">
            <Link href="/" className="text-base font-semibold tracking-tight">
              Veil<span className="text-avax">cast</span>
            </Link>
            <nav className="hidden sm:flex gap-5 text-xs">
              <span className="text-foreground">Markets</span>
              <span className="text-muted hover:text-dim transition-colors cursor-pointer">
                Portfolio
              </span>
              <span className="text-muted hover:text-dim transition-colors cursor-pointer">
                Activity
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/create"
              className="text-xs px-3 py-1.5 rounded-lg border border-border-strong text-dim hover:text-foreground hover:border-muted transition-colors"
            >
              Create
            </Link>
            <ConnectWallet />
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="h-48 bg-surface rounded-xl animate-pulse mb-8" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-surface rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : markets.length === 0 ? (
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="text-xl mb-2">No markets yet</div>
          <p className="text-sm text-muted mb-6">
            Be the first to ask a question.
          </p>
          <Link
            href="/create"
            className="inline-block text-sm px-5 py-2.5 rounded-lg bg-avax hover:bg-avax-hover transition-colors font-medium"
          >
            Create a market
          </Link>
        </div>
      ) : (
        <>
          {/* ─── Featured ─── */}
          {featured && <FeaturedMarket market={featured} />}

          {/* ─── Filters ─── */}
          <div className="max-w-6xl mx-auto px-6 pt-6 pb-2 flex items-center gap-4">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs pb-1 transition-colors ${
                  filter === f
                    ? "text-foreground border-b border-avax"
                    : "text-muted hover:text-dim"
                }`}
              >
                {f}
              </button>
            ))}
            <span className="ml-auto font-mono-nums text-[10px] text-muted tracking-wide">
              {markets.length} MARKETS
            </span>
          </div>

          {/* ─── Market rows ─── */}
          <section className="max-w-6xl mx-auto px-6 pb-20">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted">
                No markets in this filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((market) => (
                  <MarketCard key={market.address} market={market} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}