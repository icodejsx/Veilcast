"use client";

import Link from "next/link";
import { useOddsHistory } from "@/app/hooks/useOddsHistory";
import type { MarketData } from "@/app/hooks/useMarkets";
import { getYesPercent, getVolume } from "@/app/lib/odds";
import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
  } from "recharts";

export function FeaturedMarket({ market }: { market: MarketData }) {
  const yesPercent = getYesPercent(market.totalYes, market.totalNo);
  const noPercent = 100 - yesPercent;
  const volume = getVolume(market.totalYes, market.totalNo);

  const { points } = useOddsHistory(market.address);

  const data = points.map((p, i) => ({
    time: `#${i + 1}`,
    yes: p.yesPercent,
    no: 100 - p.yesPercent,
  }));
  data.push({ time: "Now", yes: yesPercent, no: noPercent });

  const startPercent = points.length > 0 ? points[0].yesPercent : 50;
  const change = yesPercent - startPercent;

  return (
    <section className="border-b border-border-subtle">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono-nums text-[10px] tracking-widest text-avax">
            FEATURED
          </span>
          <span className="h-px flex-1 bg-border-subtle" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-8 items-center">
          <div>
            <Link href={`/market/${market.address}`}>
              <h2 className="text-2xl leading-snug mb-5 hover:text-white transition-colors">
                {market.question}
              </h2>
            </Link>

            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-mono-nums text-6xl font-semibold text-yes leading-none tracking-tight">
                {yesPercent}
              </span>
              <span className="font-mono-nums text-2xl text-yes">%</span>
              {change !== 0 && (
                <span
                  className={`font-mono-nums text-xs ml-2 ${
                    change > 0 ? "text-yes" : "text-no"
                  }`}
                >
                  {change > 0 ? "▲" : "▼"} {Math.abs(change)} today
                </span>
              )}
            </div>

            <div className="text-xs text-muted mb-6">
              chance yes · {volume} AVAX volume
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href={`/market/${market.address}`}
                className="text-center py-3 text-xs rounded-lg bg-yes-bg border border-yes/30 text-yes hover:bg-yes/20 transition-colors"
              >
                Buy yes · {yesPercent}¢
              </Link>
              <Link
                href={`/market/${market.address}`}
                className="text-center py-3 text-xs rounded-lg border border-border-strong text-no hover:border-no/50 transition-colors"
              >
                Buy no · {noPercent}¢
              </Link>
            </div>
          </div>

          <div className="h-48">
            {data.length > 1 ? (
             <ResponsiveContainer width="100%" height="100%">
             <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
               <XAxis dataKey="time" tick={{ fill: "#3a3a3a", fontSize: 10 }} axisLine={false} tickLine={false} />
               <YAxis domain={[0, 100]} tick={{ fill: "#3a3a3a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} />
               <Tooltip contentStyle={{ background: "#141414", border: "1px solid #333", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#888" }} />
               <Line type="stepAfter" dataKey="yes" name="Yes" stroke="#1D9E75" strokeWidth={2} dot={false} isAnimationActive={false} />
               <Line type="stepAfter" dataKey="no" name="No" stroke="#E24B4A" strokeWidth={2} dot={false} isAnimationActive={false} />
             </LineChart>
           </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted border border-border-subtle rounded-xl">
                No trades yet
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}