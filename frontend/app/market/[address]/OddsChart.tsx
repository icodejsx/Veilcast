"use client";

import { useOddsHistory } from "@/app/hooks/useOddsHistory";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function OddsChart({
  marketAddress,
  currentYesPercent,
}: {
  marketAddress: `0x${string}`;
  currentYesPercent: number;
}) {
  const { points, isLoading } = useOddsHistory(marketAddress);

  const data = points.map((p) => ({
    time: new Date(p.time * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    yes: p.yesPercent,
  }));

  data.push({ time: "Now", yes: currentYesPercent });

  const boxStyle = {
    height: "220px",
    background: "#0f0f0f",
    border: "1px solid #1a1a1a",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#444",
    fontSize: "13px",
  } as const;

  if (isLoading) {
    return <div style={boxStyle}>Loading odds history…</div>;
  }

  if (data.length <= 1) {
    return <div style={boxStyle}>Odds chart appears once betting begins</div>;
  }

  return (
    <div style={{ height: "220px", background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: "12px", padding: "16px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="yesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1D9E75" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#1D9E75" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fill: "#666", fontSize: 11 }} axisLine={{ stroke: "#222" }} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} />
          <Tooltip contentStyle={{ background: "#141414", border: "1px solid #333", borderRadius: "8px", color: "white", fontSize: "13px" }} formatter={(value: number) => [value + "% YES", ""]} />
          <Area type="monotone" dataKey="yes" stroke="#1D9E75" strokeWidth={2} fill="url(#yesFill)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}