import { ethers } from "hardhat";

const FACTORY_ADDRESS = "0x256760863a2F5fa430e9Fa943a7158AD47FEEe7a";

// days from now -> unix timestamp
function daysFromNow(days: number): number {
  return Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;
}

const MARKETS = [
  // Crypto
  { q: "Will AVAX close above $50 by end of 2026?", days: 180 },
  { q: "Will Bitcoin reach $150,000 before December 2026?", days: 150 },
  { q: "Will Ethereum flip Bitcoin in market cap by 2027?", days: 200 },
  { q: "Will a major stablecoin depeg below $0.95 in 2026?", days: 120 },
  { q: "Will Avalanche TVL exceed $5 billion by Q4 2026?", days: 160 },

  // Sports
  { q: "Will Argentina win the 2026 FIFA World Cup?", days: 30 },
  { q: "Will France reach the 2026 World Cup final?", days: 25 },
  { q: "Will Kylian Mbappe win the 2026 Golden Boot?", days: 30 },
  { q: "Will Real Madrid win the 2027 Champions League?", days: 300 },

  // Politics
  { q: "Will the US Federal Reserve cut rates before September 2026?", days: 60 },
  { q: "Will the UK hold a general election before 2027?", days: 250 },
  { q: "Will a new US federal crypto bill pass in 2026?", days: 170 },

  // Tech
  { q: "Will OpenAI release GPT-6 before 2027?", days: 220 },
  { q: "Will Apple announce an AI-powered Siri rebuild in 2026?", days: 140 },
  { q: "Will Nvidia stock double from current levels by 2027?", days: 280 },
];

async function main() {
  const factory = await ethers.getContractAt("MarketFactory", FACTORY_ADDRESS);
  const [signer] = await ethers.getSigners();

  const balance = await ethers.provider.getBalance(signer.address);
  console.log("Balance:", ethers.formatEther(balance), "AVAX\n");
  console.log("Creating", MARKETS.length, "markets...\n");

  const created: string[] = [];

  for (let i = 0; i < MARKETS.length; i++) {
    const m = MARKETS[i];
    const endTime = daysFromNow(m.days);

    process.stdout.write(`[${i + 1}/${MARKETS.length}] ${m.q.slice(0, 45)}... `);

    const tx = await factory.createMarket(m.q, endTime);
    await tx.wait();

    const all = await factory.getAllMarkets();
    const addr = all[all.length - 1];
    created.push(addr);

    console.log("OK", addr.slice(0, 10));
  }

  console.log("\nDone. Created", created.length, "markets.");
  console.log("\nAddresses (save these for the trade script):");
  created.forEach((a, i) => console.log(`  ${i + 1}. ${a}`));

  const after = await ethers.provider.getBalance(signer.address);
  console.log("\nBalance after:", ethers.formatEther(after), "AVAX");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});