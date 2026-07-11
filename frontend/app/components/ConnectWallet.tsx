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
        style={{ background: "#141414", color: "white", border: "1px solid #333", borderRadius: "10px", padding: "10px 16px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}
      >
        {address.slice(0, 6)}…{address.slice(-4)}
      </button>
    );
  }

  const injectedConnector =
    connectors.find((c) => c.type === "injected") ?? connectors[0];

  return (
    <button
      onClick={() => {
        if (injectedConnector) {
          connect({ connector: injectedConnector });
        } else {
          alert("No wallet found. Is MetaMask installed and enabled?");
        }
      }}
      disabled={isPending}
      style={{ background: "#E84142", color: "white", border: "none", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer", opacity: isPending ? 0.6 : 1 }}
    >
      {isPending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
