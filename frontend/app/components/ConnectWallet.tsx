"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="font-mono-nums text-[11px] px-3 py-1.5 rounded-lg border border-border-strong text-dim hover:text-foreground hover:border-muted transition-colors"
      >
        {address.slice(0, 6).toUpperCase()}…{address.slice(-4).toUpperCase()}
      </button>
    );
  }

  const injected = connectors.find((c) => c.type === "injected");
  const wc = connectors.find((c) => c.id === "walletConnect");

  // Is a browser wallet actually available? (false on mobile)
  const hasInjected =
    typeof window !== "undefined" && typeof window.ethereum !== "undefined";

  function handleClick() {
    // No extension (mobile) → go straight to WalletConnect
    if (!hasInjected && wc) {
      connect({ connector: wc });
      return;
    }
    // Extension available → show the picker
    setOpen((o) => !o);
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="text-[11px] px-3.5 py-1.5 rounded-lg bg-avax hover:bg-avax-hover text-white font-medium transition-colors disabled:opacity-50"
      >
        {isPending ? "Connecting…" : "Connect"}
      </button>

      {open && hasInjected && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-44 bg-surface border border-border-strong rounded-xl p-1.5 shadow-xl">
            {injected && (
              <button
                onClick={() => {
                  connect({ connector: injected });
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-surface-hover transition-colors"
              >
                Browser wallet
              </button>
            )}
            {wc && (
              <button
                onClick={() => {
                  connect({ connector: wc });
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-surface-hover transition-colors"
              >
                WalletConnect
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}