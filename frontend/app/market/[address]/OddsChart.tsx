"use client";

import { useOddsHistory } from "@/app/hooks/useOddsHistory";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function OddsChart({
  marketAddress,
  currentYesPercent,
}: {
  marketAddress: `0x${string}`;
  currentYesPercent: number;
}) {
  const { points, isLoading } = useOddsHistory(marketAddress);

  const data = points.map((p, i) => ({
    time: `#${i + 1}`,
    yes: p.yesPercent,
    no: 100 - p.yesPercent,
  }));

  data.push({
    time: "Now",
    yes: currentYesPercent,
    no: 100 - currentYesPercent,
  });

  if (isLoading) {
    return <div className="py-8 text-center text-xs text-muted">Loading history…</div>;
  }

  if (data.length <= 1) {
    return (
      <div className="py-6 text-center text-xs text-muted">
        No trades yet — chart appears after the first bet
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-5 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yes" />
          <span className="text-xs text-dim">Yes</span>
          <span className="font-mono-nums text-xs text-yes">{currentYesPercent}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-no" />
          <span className="text-xs text-dim">No</span>
          <span className="font-mono-nums text-xs text-no">{100 - currentYesPercent}%</span>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -24 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="time" tick={{ fill: "#3a3a3a", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "#3a3a3a", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => v + "%"} />
            <Tooltip contentStyle={{ background: "#141414", border: "1px solid #333", borderRadius: "8px", fontSize: "12px" }} labelStyle={{ color: "#888" }} />
            <Line type="stepAfter" dataKey="yes" name="Yes" stroke="#1D9E75" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line type="stepAfter" dataKey="no" name="No" stroke="#E24B4A" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}