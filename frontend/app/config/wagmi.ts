import { createConfig, http } from "wagmi";
import { avalancheFuji } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = "cbd8d5b22d9542a89345943e95dcc3c4";

// Falls back to the public RPC if the env var isn't set
const rpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL ||
  "https://api.avax-test.network/ext/bc/C/rpc";

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected(),
    walletConnect({
      projectId,
      metadata: {
        name: "Veilcast",
        description: "Prediction markets on Avalanche",
        url: "https://veilcast-9rp3.vercel.app",
        icons: [],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [avalancheFuji.id]: http(rpcUrl),
  },
  ssr: true,
});