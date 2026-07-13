"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

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

  const injectedConnector =
    connectors.find((c) => c.type === "injected") ?? connectors[0];

  return (
    <button
      onClick={() => injectedConnector && connect({ connector: injectedConnector })}
      disabled={isPending}
      className="text-[11px] px-3.5 py-1.5 rounded-lg bg-avax hover:bg-avax-hover text-white ft-medium transition-colors disabled:opacity-50"
    >
      {isPending ? "Connecting…" : "Connect"}
    </button>
  );
}
