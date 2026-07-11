"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from "viem";
import { ConnectWallet } from "@/app/components/ConnectWallet";
import { MARKET_ABI } from "@/app/config/contracts";

export function BetPanel({
  marketAddress,
  yesPercent,
  resolved,
  onBetPlaced,
}: {
  marketAddress: `0x${string}`;
  yesPercent: number;
  resolved: boolean;
  onBetPlaced: () => void;
}) {
  const { isConnected } = useAccount();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("1.0");

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  if (isSuccess) {
    onBetPlaced();
  }

  function placeBet() {
    if (!amount || Number(amount) <= 0) return;
    writeContract({
      address: marketAddress,
      abi: MARKET_ABI,
      functionName: side === "yes" ? "betYes" : "betNo",
      value: parseEther(amount),
    });
  }

  const noPercent = 100 - yesPercent;

  return (
    <div style={{ background: "#141414", border: "1px solid #222", borderRadius: "16px", padding: "20px", height: "fit-content" }}>
      <div style={{ fontSize: "14px", fontWeight: 500, color: "#ccc", marginBottom: "16px" }}>
        Place your bet
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        <button
          onClick={() => setSide("yes")}
          style={{
            border: side === "yes" ? "2px solid #1D9E75" : "1px solid #333",
            background: side === "yes" ? "rgba(29,158,117,0.1)" : "transparent",
            borderRadius: "10px", padding: "14px", textAlign: "center", cursor: "pointer", color: "white",
          }}
        >
          <div style={{ fontSize: "13px", color: "#1D9E75", marginBottom: "4px" }}>YES</div>
          <div style={{ fontSize: "20px", fontWeight: 600 }}>{yesPercent}¢</div>
        </button>
        <button
          onClick={() => setSide("no")}
          style={{
            border: side === "no" ? "2px solid #E24B4A" : "1px solid #333",
            background: side === "no" ? "rgba(226,75,74,0.1)" : "transparent",
            borderRadius: "10px", padding: "14px", textAlign: "center", cursor: "pointer", color: "white",
          }}
        >
          <div style={{ fontSize: "13px", color: "#E24B4A", marginBottom: "4px" }}>NO</div>
          <div style={{ fontSize: "20px", fontWeight: 600 }}>{noPercent}¢</div>
        </button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "12px", color: "#666", marginBottom: "6px" }}>Amount (AVAX)</div>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ width: "100%", boxSizing: "border-box", background: "#0f0f0f", border: "1px solid #333", borderRadius: "8px", padding: "12px", color: "white", fontSize: "16px" }}
        />
      </div>

      {resolved ? (
        <div style={{ fontSize: "13px", color: "#666", textAlign: "center", padding: "12px", background: "#0f0f0f", borderRadius: "8px" }}>
          This market is resolved
        </div>
      ) : !isConnected ? (
        <ConnectWallet />
      ) : (
        <button
          onClick={placeBet}
          disabled={isPending || isConfirming}
          style={{
            width: "100%", background: side === "yes" ? "#1D9E75" : "#E24B4A",
            color: "white", border: "none", borderRadius: "10px", padding: "14px",
            fontSize: "15px", fontWeight: 600, cursor: isPending || isConfirming ? "wait" : "pointer",
            opacity: isPending || isConfirming ? 0.6 : 1,
          }}
        >
          {isPending ? "Confirm in wallet…" : isConfirming ? "Placing bet…" : `Buy ${side.toUpperCase()}`}
        </button>
      )}

      {isSuccess && (
        <div style={{ fontSize: "13px", color: "#1D9E75", textAlign: "center", marginTop: "12px" }}>
          ✅ Bet placed!
        </div>
      )}
      {error && (
        <div style={{ fontSize: "12px", color: "#E24B4A", marginTop: "12px", wordBreak: "break-word" }}>
          {error.message.slice(0, 100)}
        </div>
      )}
    </div>
  );
}