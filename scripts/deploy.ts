import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying MarketFactory to Fuji...\n");

  // Get the deployer wallet
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "AVAX\n");

  // Deploy the factory
  const Factory = await ethers.getContractFactory("MarketFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("✅ MarketFactory deployed to:", factoryAddress);
  console.log("\n📋 Save this address — your frontend will need it!");
  console.log("🔍 View on Snowtrace: https://testnet.snowtrace.io/address/" + factoryAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});