import { ethers } from "hardhat";

async function main() {
  // 👇 Your deployed factory address
  const FACTORY_ADDRESS = "0x256760863a2F5fa430e9Fa943a7158AD47FEEe7a";

  console.log("📝 Creating a new market...\n");

  // Connect to your live factory
  const factory = await ethers.getContractAt("MarketFactory", FACTORY_ADDRESS);

  // Market question + end time (7 days from now)
  const question = "Will AVAX close above $30 by end of July 2026?";
  const endTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days

  console.log("Question:", question);
  console.log("Ends:", new Date(endTime * 1000).toLocaleString(), "\n");

  // Create the market
  const tx = await factory.createMarket(question, endTime);
  console.log("⏳ Transaction sent:", tx.hash);
  console.log("   Waiting for confirmation...\n");

  await tx.wait();

  // Fetch the new market's address
  const markets = await factory.getAllMarkets();
  const newMarket = markets[markets.length - 1];

  console.log("✅ Market created!");
  console.log("📍 Market address:", newMarket);
  console.log("📊 Total markets now:", markets.length);
  console.log("🔍 View on Snowtrace: https://testnet.snowtrace.io/address/" + newMarket);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});