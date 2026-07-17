import { ethers } from "hardhat";

const MORE = [
  {
    market: "0x46aA17a313D8F86023668d2bB3ecFb758D6Bc486", // Mbappe
    bets: [
      { side: "yes", amount: "0.007" },
      { side: "no", amount: "0.003" },
      { side: "yes", amount: "0.004" },
    ],
  },
  {
    market: "0xe457675C1Ac98C0bdEfDcbA99874623257b97143", // GPT-6
    bets: [
      { side: "no", amount: "0.005" },
      { side: "yes", amount: "0.006" },
      { side: "no", amount: "0.003" },
    ],
  },
];

async function main() {
  for (const t of MORE) {
    const market = await ethers.getContractAt("PredictionMarket", t.market);
    const info = await market.getMarketInfo();
    console.log(`\n${info[0].slice(0, 50)}`);
    for (const bet of t.bets) {
      const value = ethers.parseEther(bet.amount);
      process.stdout.write(`  ${bet.side.toUpperCase()} ${bet.amount}... `);
      const tx = bet.side === "yes"
        ? await market.betYes({ value })
        : await market.betNo({ value });
      await tx.wait();
      console.log("OK");
    }
  }
  console.log("\nDone.");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });