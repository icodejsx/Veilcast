import { ethers } from "hardhat";

// Pick 4 markets to give real trading history
const TRADES = [
  {
    market: "0xCC6196d3AFB3157eEfcf8F00Fbe31dBd03D378Ed", // AVAX $50
    bets: [
      { side: "yes", amount: "0.005" },
      { side: "no", amount: "0.008" },
      { side: "yes", amount: "0.004" },
    ],
  },
  {
    market: "0xB24BAb808609d211D6Eb6816AA32FeceD51c67F9", // BTC $150k
    bets: [
      { side: "no", amount: "0.006" },
      { side: "yes", amount: "0.005" },
      { side: "no", amount: "0.004" },
    ],
  },
  {
    market: "0xA6d143825BfA960eE2Ff320367A1C39E960b22E4", // Argentina WC
    bets: [
      { side: "yes", amount: "0.006" },
      { side: "yes", amount: "0.004" },
      { side: "no", amount: "0.005" },
    ],
  },
  {
    market: "0x8e0B7d82AA5a0D5332A9f0573647072e9593722b", // Fed rate cut
    bets: [
      { side: "yes", amount: "0.005" },
      { side: "no", amount: "0.003" },
    ],
  },
];

async function main() {
  const [signer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("Balance:", ethers.formatEther(balance), "AVAX\n");

  let total = 0;

  for (const t of TRADES) {
    const market = await ethers.getContractAt("PredictionMarket", t.market);
    const info = await market.getMarketInfo();
    console.log(`\n${info[0].slice(0, 50)}`);

    for (const bet of t.bets) {
      const value = ethers.parseEther(bet.amount);
      total += Number(bet.amount);

      process.stdout.write(`  ${bet.side.toUpperCase()} ${bet.amount} AVAX... `);

      const tx =
        bet.side === "yes"
          ? await market.betYes({ value })
          : await market.betNo({ value });
      await tx.wait();

      console.log("OK");
    }

    const after = await market.getMarketInfo();
    const yes = Number(ethers.formatEther(after[4]));
    const no = Number(ethers.formatEther(after[5]));
    const pct = Math.round((yes / (yes + no)) * 100);
    console.log(`  -> Final odds: ${pct}% YES`);
  }

  console.log("\nTotal wagered:", total.toFixed(3), "AVAX");

  const finalBal = await ethers.provider.getBalance(signer.address);
  console.log("Balance after:", ethers.formatEther(finalBal), "AVAX");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});