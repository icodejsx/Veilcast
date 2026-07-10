import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalancheFuji } from "wagmi/chains";
import { http } from "wagmi";

export const config = getDefaultConfig({
  appName: "Veilcast",
  projectId: "cbd8d5b22d9542a89345943e95dcc3c4", // we'll get this in a sec
  chains: [avalancheFuji],
  transports: {
    [avalancheFuji.id]: http("https://api.avax-test.network/ext/bc/C/rpc"),
  },
  ssr: true, // Next.js uses server-side rendering
});