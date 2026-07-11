"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MARKET_ABI } from "@/app/config/contracts";

export function ResolvePanel({
  marketAddress,
  endTime,
  resolved,
  outcome,
  onUpdate,
}: {
  marketAddress: `0x${string}`;
  endTime: bigint;
  resolved: boolean;
  outcome: boolean;
  onUpdate: () => void;
}) {
  const { address } = useAccount();

  // Read who owns this market (the resolver)
  const { data: owner } = useReadContract({
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: "owner",
  });

  // Read this user's bets + claim status
  const { data: userBets, refetch: refetchBets } = useReadContract({
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: "getUserBets",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  if (isSuccess) {
    onUpdate();
    refetchBets();
  }

  const isOwner = address && owner && address.toLowerCase() === (owner as string).toLowerCase();
  const nowSec = Math.floor(Date.now() / 1000);
  const ended = nowSec >= Number(endTime);

  const bets = userBets as [bigint, bigint, boolean] | undefined;
  const yesBet = bets?.[0] ?? 0n;
  const noBet = bets?.[1] ?? 0n;
  const claimed = bets?.[2] ?? false;

  // Did this user win?
  const userWon = resolved && ((outcome && yesBet > 0n) || (!outcome && noBet > 0n));

  function resolveMarket(result: boolean) {
    writeContract({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: "resolve",
      args: [result],
    });
  }

  function claimWinnings() {
    writeContract({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: "claim",
    });
  }

  const boxStyle = {
    background: "#141414",
    border: "1px solid #222",
    borderRadius: "16px",
    padding: "20px",
    marginTop: "16px",
  } as const;

  // ─── RESOLVED: show claim or result ───
  if (resolved) {
    return (
      <div style={boxStyle}>
        <div style={{ fontSize: "14px", fontWeight: 500, color: "#ccc", marginBottom: "12px" }}>
          Market resolved: {outcome ? "YES" : "NO"} won
        </div>
        {userWon && !claimed ? (
          <button
            onClick={claimWinnings}
            disabled={isPending}
            style={{ width: "100%", background: "#1D9E75", color: "white", border: "none", borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: 600, cursor: "pointer", opacity: isPending ? 0.6 : 1 }}
          >
            {isPending ? "Claiming…" : "Claim winnings"}
          </button>
        ) : claimed ? (
          <div style={{ fontSize: "13px", color: "#1D9E75", textAlign: "center" }}>✅ Winnings claimed</div>
        ) : (
          <div style={{ fontSize: "13px", color: "#666", textAlign: "center" }}>
            {yesBet > 0n || noBet > 0n ? "Your side didn't win" : "You didn't bet on this market"}
          </div>
        )}
      </div>
    );
  }

  // ─── ENDED + owner: show resolve buttons ───
  if (ended && isOwner) {
    return (
      <div style={boxStyle}>
        <div style={{ fontSize: "14px", fontWeight: 500, color: "#ccc", marginBottom: "12px" }}>
          Resolve market (owner)
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <button
            onClick={() => resolveMarket(true)}
            disabled={isPending}
            style={{ background: "#1D9E75", color: "white", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            YES won
          </button>
          <button
            onClick={() => resolveMarket(false)}
            disabled={isPending}
            style={{ background: "#E24B4A", color: "white", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
          >
            NO won
          </button>
        </div>
      </div>
    );
  }

  // ─── ENDED, not owner, not resolved ───
  if (ended) {
    return (
      <div style={boxStyle}>
        <div style={{ fontSize: "13px", color: "#666", textAlign: "center" }}>
          Betting closed — awaiting resolution
        </div>
      </div>
    );
  }

  // Market still open → show nothing (betting panel handles it)
  return null;
}