import { formatEther } from "viem";

// Returns YES probability as a percentage (0-100)
export function getYesPercent(totalYes: bigint, totalNo: bigint): number {
  const total = totalYes + totalNo;
  if (total === 0n) return 50; // no bets yet → 50/50
  // Convert to numbers for the percentage (safe here, we only need display precision)
  const yes = Number(formatEther(totalYes));
  const no = Number(formatEther(totalNo));
  return Math.round((yes / (yes + no)) * 100);
}

// Total volume in AVAX as a display string
export function getVolume(totalYes: bigint, totalNo: bigint): string {
  const total = totalYes + totalNo;
  return Number(formatEther(total)).toFixed(2);
}

// Format a unix timestamp (bigint seconds) to a readable date
export function formatEndTime(endTime: bigint): string {
  const date = new Date(Number(endTime) * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}