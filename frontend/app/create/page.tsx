"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/app/hooks/useIsAdmin";
import Link from "next/link";
import { ConnectWallet } from "@/app/components/ConnectWallet";
import { FACTORY_ADDRESS, FACTORY_ABI } from "@/app/config/contracts";

export default function CreatePage() {
  const { isConnected } = useAccount();
  const router = useRouter();
  const { isAdmin } = useIsAdmin();
  const [question, setQuestion] = useState("");
  const [endDate, setEndDate] = useState("");

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  function createMarket() {
    if (!question.trim()) return;
    if (!endDate) return;

    // Convert the datetime-local string to a unix timestamp (seconds)
    const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

    if (endTimestamp <= Math.floor(Date.now() / 1000)) {
      alert("End time must be in the future");
      return;
    }

    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "createMarket",
      args: [question, BigInt(endTimestamp)],
    });
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    background: "#0f0f0f",
    border: "1px solid #333",
    borderRadius: "10px",
    padding: "14px",
    color: "white",
    fontSize: "15px",
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "white" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #1a1a1a" }}>
        <Link href="/" style={{ fontSize: "22px", fontWeight: 600, textDecoration: "none", color: "white" }}>
          Veil<span style={{ color: "#E84142" }}>cast</span>
        </Link>
        <ConnectWallet />
      </header>

      {!isAdmin ? (
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div className="text-lg mb-2">Admin only</div>
          <p className="text-sm text-muted mb-6">
            Market creation is restricted to the platform admin. Markets are
            curated to ensure clear, resolvable questions.
          </p>
          <Link
            href="/"
            className="inline-block text-sm px-5 py-2.5 rounded-lg border border-border-strong text-dim hover:text-foreground transition-colors"
          >
            Back to markets
          </Link>
        </div>
      ) : (

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 32px" }}>
        <Link href="/" style={{ fontSize: "13px", color: "#888", textDecoration: "none" }}>
          ← Back to markets
        </Link>

        <h1 style={{ fontSize: "28px", fontWeight: 600, margin: "20px 0 8px" }}>
          Create a market
        </h1>
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "32px" }}>
          Ask a yes/no question. You&apos;ll resolve it after it ends.
        </p>

        {isSuccess ? (
          <div style={{ background: "#141414", border: "1px solid #1D9E75", borderRadius: "16px", padding: "24px", textAlign: "center" }}>
            <div style={{ fontSize: "16px", color: "#1D9E75", marginBottom: "16px" }}>
              ✅ Market created!
            </div>
            <button
              onClick={() => router.push("/")}
              style={{ background: "#1D9E75", color: "white", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            >
              View all markets
            </button>
          </div>
        ) : (
          <div style={{ background: "#141414", border: "1px solid #222", borderRadius: "16px", padding: "24px", display: "grid", gap: "20px" }}>
            <div>
              <div style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", fontWeight: 500 }}>
                Question
              </div>
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Will AVAX close above $50 by Dec 2026?"
                style={inputStyle}
              />
              <div style={{ fontSize: "12px", color: "#666", marginTop: "6px" }}>
                Must have a clear yes/no answer.
              </div>
            </div>

            <div>
              <div style={{ fontSize: "13px", color: "#ccc", marginBottom: "8px", fontWeight: 500 }}>
                Betting closes
              </div>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
              />
              <div style={{ fontSize: "12px", color: "#666", marginTop: "6px" }}>
                After this, you can resolve the outcome.
              </div>
            </div>

            {!isConnected ? (
              <ConnectWallet />
            ) : (
              <button
                onClick={createMarket}
                disabled={isPending || isConfirming || !question.trim() || !endDate}
                style={{
                  width: "100%",
                  background: "#E84142",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "14px",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: isPending || isConfirming ? "wait" : "pointer",
                  opacity: isPending || isConfirming || !question.trim() || !endDate ? 0.5 : 1,
                }}
              >
                {isPending ? "Confirm in wallet…" : isConfirming ? "Creating market…" : "Create market"}
              </button>
            )}

            {error && (
              <div style={{ fontSize: "12px", color: "#E24B4A", wordBreak: "break-word" }}>
                {error.message.slice(0, 120)}
              </div>
            )}
          </div>
        )}
      </div>
      )}
    </main>
  );
}