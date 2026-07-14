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

 const injectedConnector = connectors.find((c) => c.type === "injected");
  const wcConnector = connectors.find(
    (c) => c.id === "walletConnect" || c.type === "walletConnect"
  );

  const hasInjected =
    typeof window !== "undefined" &&
    typeof (window as any).ethereum !== "undefined";

    function handleClick() {
        // Desktop with extension → show picker
        if (hasInjected) {
          setOpen((o) => !o);
          return;
        }
    
        // Mobile: deep-link into MetaMask's in-app browser
        const isMobile =
          typeof navigator !== "undefined" &&
          /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
        if (isMobile) {
          const host = window.location.host + window.location.pathname;
          window.location.href = `https://metamask.app.link/dapp/${host}`;
          return;
        }
    
        // Desktop without extension → WalletConnect QR
        if (wcConnector) {
          connect({ connector: wcConnector });
        }
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
          {injectedConnector && (
              <button
                onClick={() => {
                    connect({ connector: injectedConnector });
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-surface-hover transition-colors"
              >
                Browser wallet
              </button>
            )}
            {wcConnector && (
              <button
                onClick={() => {
                  connect({ connector: wcConnector });
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