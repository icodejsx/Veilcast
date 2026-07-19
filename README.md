# Veilcast

**Prediction markets, settled on-chain. Built natively for Avalanche.**

Veilcast is a binary prediction market where anyone can trade on the outcome of real-world events. Positions are held by the contract, odds are derived from pool weights, and settlement happens on-chain — no custodian, no off-chain ledger.

🔗 **Live app:** https://veilcast-9rp3.vercel.app
📄 **Factory contract (verified):** [`0x023B2A09…8Cf23`](https://testnet.snowtrace.io/address/0x023B2A098e093372413BF7020deBA06391e8Cf23#code)
📄 **Market contract (verified):** [`0x6B6F9736…510b9`](https://testnet.snowtrace.io/address/0x6B6F97360655328E505a68D2b993b5c0a62510b9#code)
🌐 **Network:** Avalanche Fuji (C-Chain, chainId 43113)

---

## What works today

This is a functioning product, not a mockup. Every feature below is live on Fuji:

- **15 markets** across crypto, sports, politics, and tech
- **Real trading** — bets are AVAX transfers into the market contract
- **Live odds** — YES/NO pricing derived from pool weights, updating per trade
- **Historical charts** — reconstructed from on-chain `BetPlaced` events
- **Resolution and payout** — market owner resolves, winners claim their stake plus a proportional share of the losing pool, minus a 2% protocol fee
- **Admin-gated market creation** — enforced on-chain, not just in the UI
- **Wallet support** — browser extension on desktop, deep-link to MetaMask on mobile

---

## Why Avalanche

Prediction markets are a high-frequency, low-value-per-transaction product. A user placing a $2 bet cannot pay $8 in gas. That constraint rules out most L1s and makes Avalanche's C-Chain a natural fit rather than an arbitrary choice.

**Transaction cost.** Deploying all 15 market contracts cost approximately 0.000000003 AVAX in total gas. Individual bets cost a fraction of a cent. On Ethereum mainnet the same deployment would run into hundreds of dollars, and every bet would carry gas comparable to the bet itself.

**Finality.** Avalanche consensus finalises in roughly a second. When a user places a bet, the odds visibly move almost immediately. On chains with probabilistic finality, the UI has to either lie optimistically or make the user wait — both are bad for a market that trades on live events.

**EVM compatibility.** The contracts are standard Solidity using OpenZeppelin primitives. There was no need to learn a new VM or language to get to a working product, which matters for a solo builder shipping an MVP.

**Subnet path.** A production version of this could run on a dedicated subnet with a custom gas token, letting the protocol subsidise or eliminate gas for traders entirely. That option doesn't exist on a general-purpose L1.

---

## Architecture

```
MarketFactory (admin-gated)
    │
    ├── deploys ──> PredictionMarket #1
    ├── deploys ──> PredictionMarket #2
    └── deploys ──> PredictionMarket #n

Next.js frontend
    ├── wagmi + viem ──> reads/writes contracts directly
    └── /api/history ──> server-side event indexer (cached)
```

### Contracts

**`MarketFactory.sol`** — deploys and tracks market contracts. `createMarket` is gated behind an `onlyAdmin` modifier, so only the deploying wallet can list new markets.

**`PredictionMarket.sol`** — one contract per question. Holds both pools, records positions per address, handles resolution and claims.

Payout math:

```
userShare   = userStake / winningPool
grossPayout = userStake + (userShare × losingPool)
netPayout   = grossPayout × 0.98        // 2% protocol fee
```

Security measures: OpenZeppelin `ReentrancyGuard` on all value-transferring functions, `Ownable` for resolution authority, checks-effects-interactions ordering on claims, and a one-time `hasClaimed` flag per address.

### Frontend

Next.js 16 (App Router) with wagmi and viem for chain interaction. Reads are free and require no wallet — anyone can browse markets, view odds, and inspect charts without connecting. Only betting, resolving, and claiming require a signature.

---

## Two decisions worth explaining

### Market creation is admin-only

The first version let anyone create markets. That's more decentralised on paper and worse in practice: a user could create a market, take the other side of every bet, and then resolve it in their own favour. Without an oracle or dispute mechanism, permissionless creation is an attack vector, not a feature.

Polymarket curates every market through an internal team. Kalshi, as a CFTC-regulated exchange, requires regulatory approval per market. Veilcast follows the same pattern for the same reason. `createMarket` reverts for any caller other than the factory admin, and the UI hides the creation flow entirely unless the connected wallet matches the on-chain admin address.

The roadmap below describes how this opens up once resolution is trustless.

### Chart history is indexed server-side

The contracts store current pool totals, not history. To draw an odds chart, the app replays `BetPlaced` events and computes running odds after each trade — real data, no interpolation.

The naive implementation had every market card query the chain directly. With 15 markets and Avalanche's 2,048-block cap on `eth_getLogs`, that produced several hundred RPC calls per page load and hit rate limits on every provider tried, including a dedicated endpoint.

The fix was a server-side indexer: a single Next.js API route scans all markets once, computes odds series for each, and caches the result. The browser makes one request instead of hundreds. This also keeps the RPC key server-side rather than shipping it in the client bundle.

A production version would persist these events to a database with a listener rather than re-scanning on cache expiry.

---

## Running locally

```bash
git clone <repo-url>
cd Veilcast
npm install

# Contracts
npx hardhat compile
npx hardhat test

# Frontend
cd frontend
npm install
npm run dev
```

Environment variables:

```bash
# Root .env — for deployment scripts
PRIVATE_KEY=your_deployer_key

# frontend/.env.local — for the app
NEXT_PUBLIC_RPC_URL=your_avalanche_fuji_rpc
RPC_URL=your_avalanche_fuji_rpc   # server-side, used by the indexer
```

Testnet AVAX: https://faucet.avax.network

---

## Known limitations

Stated plainly, because they're the honest scope of an MVP:

**Resolution is centralised.** The market owner declares the outcome. There is no oracle, no dispute window, and no economic penalty for resolving dishonestly. This is the single largest gap between Veilcast and a trustless prediction market.

**Binary markets only.** Each market has exactly two outcomes. Multi-outcome markets — "who wins the World Cup" with eight candidates — require a different contract design.

**Pool-weighted pricing, not an order book.** Odds are the ratio of pool sizes. There is no limit-order matching, no market maker, and large bets move the price against the person placing them.

**No liquidity incentives.** Nothing rewards early participants for providing liquidity to thin markets.

**Testnet only.** No audit has been performed. These contracts should not hold real value in their current state.

---

## Roadmap

**Trustless resolution.** Integrate an optimistic oracle — a proposer stakes a bond on an outcome, a challenge window opens, and disputes escalate to a decentralised vote. This is what Polymarket does with UMA. It is the prerequisite for everything else, because it's what makes permissionless market creation safe.

**Permissionless creation.** Once resolution no longer depends on the creator's honesty, the admin gate can be replaced with a creation bond. Anyone can list a market by staking AVAX; the stake is slashable if the question is malformed or unresolvable.

**Multi-outcome markets.** Extend the contract to N outcomes with a shared pool, enabling markets like "who wins the election" rather than a separate binary market per candidate.

**Order book pricing.** Replace pool-weighted odds with a matching engine, or an LMSR-style automated market maker, to give tighter spreads and reduce slippage on larger positions.

**Persistent indexing.** Replace the on-demand event scan with a listener that writes to a database, enabling instant chart loads and historical analytics regardless of market count.

**Subnet deployment.** Evaluate a dedicated Avalanche subnet with a custom gas token, allowing the protocol to subsidise transaction costs and remove the last friction point for small traders.

---

## Stack

Solidity 0.8.28 · Hardhat · OpenZeppelin · Next.js 16 · TypeScript · wagmi · viem · Recharts · Tailwind CSS 4 · Avalanche Fuji C-Chain

---

## Contract addresses

| Contract | Address |
|---|---|
| MarketFactory | [`0x023B2A098e093372413BF7020deBA06391e8Cf23`](https://testnet.snowtrace.io/address/0x023B2A098e093372413BF7020deBA06391e8Cf23#code) |
| Example market | [`0x6B6F97360655328E505a68D2b993b5c0a62510b9`](https://testnet.snowtrace.io/address/0x6B6F97360655328E505a68D2b993b5c0a62510b9#code) |

Both verified on Snowtrace. Source is readable on-chain.