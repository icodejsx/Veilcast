"use client";

import { useMarketHistory } from "@/app/hooks/useAllHistory";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

export function Sparkline({
  marketAddress,
  currentYesPercent,
}: {
  marketAddress: `0x${string}`;
  currentYesPercent: number;
}) {
  const { points, isLoading } = useMarketHistory(marketAddress);

  const data = points.map((p) => ({ yes: p.yes }));
  data.push({ yes: currentYesPercent });

  if (isLoading || data.length <= 1) {
    return <div className="h-8 w-full" />;
  }

  return (
    <div className="h-8 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={[0, 100]} hide />
          <Line
            type="stepAfter"
            dataKey="yes"
            stroke="#1D9E75"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}