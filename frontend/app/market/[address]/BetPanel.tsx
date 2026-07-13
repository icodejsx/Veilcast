"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { parseEther, formatEther } from "viem";
import { ConnectWallet } from "@/app/components/ConnectWallet";
import { MARKET_ABI } from "@/app/config/contracts";

export function BetPanel({
  marketAddress,
  yesPercent,
  resolved,
  ended,
  totalYes,
  totalNo,
  onBetPlaced,
}: {
  marketAddress: `0x${string}`;
  yesPercent: number;
  resolved: boolean;
  ended: boolean;
  totalYes: bigint;
  totalNo: bigint;
  onBetPlaced: () => void;
}) {
  const { isConnected, address } = useAccount();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("0.10");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Read user's existing position
  const { data: userBets } = useReadContract({
    address: marketAddress,
    abi: MARKET_ABI,
    functionName: "getUserBets",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const bets = userBets as [bigint, bigint, boolean] | undefined;
  const yesBet = bets?.[0] ?? 0n;
  const noBet = bets?.[1] ?? 0n;

  if (isSuccess) onBetPlaced();

  const noPercent = 100 - yesPercent;

  // Payout math: your stake + your share of the losing pool, minus 2% fee
  function calcPayout(): string {
    const amt = Number(amount);
    if (!amt || amt <= 0) return "0.00";

    const yes = Number(formatEther(totalYes));
    const no = Number(formatEther(totalNo));

    const winPool = side === "yes" ? yes + amt : no + amt;
    const losePool = side === "yes" ? no : yes;

    const gross = amt + (amt / winPool) * losePool;
    const payout = gross * 0.98;
    return payout.toFixed(3);
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

  const positionText =
    yesBet > 0n
      ? `${Number(formatEther(yesBet)).toFixed(2)} YES`
      : noBet > 0n
      ? `${Number(formatEther(noBet)).toFixed(2)} NO`
      : "NONE";

  return (
    <div className="p-5">
      <div className="font-mono-nums text-[11px] tracking-wider text-muted mb-3">
        PLACE BET
      </div>

      {/* YES / NO */}
      <div className="grid grid-cols-2 gap-1.5 mb-3.5">
        <button
          onClick={() => setSide("yes")}
          disabled={resolved || ended}
          className={`py-3 grid gap-0.5 justify-items-center rounded-lg transition-colors ${
            side === "yes"
              ? "bg-yes-bg border border-yes/50"
              : "border border-border-subtle hover:border-border-strong"
          } disabled:opacity-40`}
        >
          <span className="font-mono-nums text-[10px] text-yes">YES</span>
          <span className={`font-mono-nums text-[17px] ${side === "yes" ? "text-yes" : "text-dim"}`}>
            {yesPercent}¢
          </span>
        </button>
        <button
          onClick={() => setSide("no")}
          disabled={resolved || ended}
          className={`py-3 grid gap-0.5 justify-items-center rounded-lg transition-colors ${
            side === "no"
              ? "bg-no-bg border border-no/50"
              : "border border-border-subtle hover:border-border-strong"
          } disabled:opacity-40`}
        >
          <span className="font-mono-nums text-[10px] text-no">NO</span>
          <span className={`font-mono-nums text-[17px] ${side === "no" ? "text-no" : "text-dim"}`}>
            {noPercent}¢
          </span>
        </button>
      </div>

      {/* Amount */}
      <div className="font-mono-nums text-[10px] text-muted mb-1.5">
        AMOUNT · AVAX
      </div>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={resolved || ended}
        className="w-full bg-background border border-border-strong rounded-lg px-3 py-2.5 font-mono-nums text-sm focus:outline-none focus:border-muted transition-colors mb-3.5 disabled:opacity-40"
      />

      {/* Payout preview */}
      <div className="flex justify-between text-[11px] py-2.5 border-y border-border-subtle mb-3.5">
        <span className="text-muted">Payout if {side}</span>
        <span className={`font-mono-nums ${side === "yes" ? "text-yes" : "text-no"}`}>
          {calcPayout()} AVAX
        </span>
      </div>

      {/* Action */}
      {resolved ? (
        <div className="text-center py-3 text-xs text-muted border border-border-subtle rounded-lg">
          Market resolved
        </div>
      ) : ended ? (
        <div className="text-center py-3 text-xs text-muted border border-border-subtle rounded-lg">
          Betting closed
        </div>
      ) : !isConnected ? (
        <ConnectWallet />
      ) : (
        <button
          onClick={placeBet}
          disabled={isPending || isConfirming}
          className={`w-full py-3 rounded-lg text-[13px] font-medium transition-colors ${
            side === "yes"
              ? "bg-yes hover:bg-yes/90"
              : "bg-no hover:bg-no/90"
          } text-white disabled:opacity-50`}
        >
          {isPending
            ? "Confirm in wallet…"
            : isConfirming
            ? "Placing bet…"
            : `Buy ${side}`}
        </button>
      )}

      {isSuccess && (
        <div className="text-center text-[11px] text-yes mt-2.5">Bet placed</div>
      )}
      {error && (
        <div className="text-[10px] text-no mt-2.5 break-words">
          {error.message.slice(0, 80)}
        </div>
      )}

      {/* Meta */}
      <div className="mt-5 pt-3.5 border-t border-border-subtle grid gap-2">
        <div className="flex justify-between text-[11px]">
          <span className="text-muted">Your position</span>
          <span className="font-mono-nums text-dim">{positionText}</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-muted">Platform fee</span>
          <span className="font-mono-nums text-dim">2%</span>
        </div>
      <div className="flex justify-between text-[11px]">
          <span className="text-muted">Contract</span>
          <a
            href={"https://testnet.snowtrace.io/address/" + marketAddress}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono-nums text-avax hover:underline"
          >
            {marketAddress.slice(0, 6)}…{marketAddress.slice(-3)} ↗
          </a>
        </div>
      </div>
    </div>
  );
}