# Axis Arena - Sustainable Economics Model

> Community-aligned tokenomics and liquidity flow for long-term sustainability

---

## 🎯 Core Philosophy

**"AI plays, humans bet, community wins"**

Axis Arena is designed to be:
1. **Sustainable** - Self-funding through protocol fees
2. **Fair** - No VC premine, no insider allocation
3. **Community-owned** - Treasury governed by players
4. **Composable** - Open integration with EGS platforms

---

## 💰 Token Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AXIS ARENA ECONOMY                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐      BETS       ┌──────────┐      PRIZES    ┌──────┐ │
│  │  HUMANS  │ ──────────────► │  PRIZE   │ ─────────────► │WINNER│ │
│  │(Bettors) │                 │   POOL   │                │AGENT │ │
│  └──────────┘                 └────┬─────┘                └──────┘ │
│                                    │                                │
│                              5% Protocol Fee                        │
│                                    │                                │
│                                    ▼                                │
│                            ┌──────────────┐                        │
│                            │   TREASURY   │                        │
│                            │  (Community) │                        │
│                            └──────────────┘                        │
│                                    │                                │
│                    ┌───────────────┼───────────────┐               │
│                    ▼               ▼               ▼               │
│              ┌──────────┐   ┌──────────┐   ┌──────────┐           │
│              │ Dev Fund │   | Rewards  │   │ Liquidity│           │
│              │   40%    │   │   40%    │   │   20%    │           │
│              └──────────┘   └──────────┘   └──────────┘           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Fee Structure

### Betting Fees

| Fee Type | Rate | Destination |
|----------|------|-------------|
| Protocol Fee | 5% | Treasury |
| Platform Fee | 0-2% | EGS Platform (optional) |
| Winner Takes | 93-95% | Winning Agent's Bettors |

### Example Flow

```
Human bets: 100 x402
├── Treasury: 5 x402 (5%)
├── Prize Pool: 95 x402 (95%)
│
Winner's bettors split the pool proportionally:
├── If winner had 50% of bets → 50% of pool
└── If you bet 10 x402 on winner → 19 x402 return (90% profit!)
```

---

## 🏛️ Treasury Governance

### Treasury Allocation

| Category | Allocation | Purpose |
|----------|------------|---------|
| Development Fund | 40% | Ongoing development, security audits |
| Community Rewards | 40% | Tournaments, liquidity mining, agent rewards |
| Liquidity Provision | 20% | DEX liquidity, price stability |

### Governance Model

```cairo
// Proposed: Treasury governance via NFT voting
struct TreasuryProposal {
    proposal_id: u32,
    proposal_type: u8,  // 0=spend, 1=allocate, 2=update_fee
    amount: u256,
    recipient: ContractAddress,
    votes_for: u256,
    votes_against: u256,
    deadline: u64,
    executed: bool,
}

// Voting power = Number of games played + Bets placed
// Prevents plutocracy, rewards active participants
```

### Proposal Thresholds

- **Minimum Voting Power**: 10 games played OR 100 x402 bet
- **Quorum**: 20% of active voting power
- **Pass Threshold**: 60% of votes cast

---

## 💧 Liquidity Flow

### Token: x402 (Existing)

Axis Arena uses x402 token for:
1. **Betting** - Humans bet on agent outcomes
2. **Prizes** - Winners receive x402
3. **Fees** - Treasury accumulates x402

### Liquidity Provision

```
Treasury LP Strategy:
├── 20% of fees → x402/ETH LP on Uniswap
├── LP tokens → Staked for yield
└── Yield → Additional treasury revenue
```

### Price Stability Mechanisms

1. **Fee Burns** (Optional governance decision)
   - Treasury can vote to burn accumulated x402
   - Creates deflationary pressure

2. **Buyback & Distribute**
   - Treasury buys x402 with accumulated fees
   - Distributes to active players/agents

3. **Liquidity Mining**
   - LP providers earn governance tokens
   - Deep liquidity reduces slippage

---

## 🎮 Agent Economics

### Agent Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                   AGENT LIFECYCLE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. SPAWN                                                   │
│     Owner deploys agent with:                               │
│     ├── Name (felt252)                                      │
│     └── Personality (0-3)                                   │
│                                                             │
│  2. COMPETE                                                 │
│     Agent earns by:                                         │
│     ├── Kills: +100 score points                           │
│     ├── Territories: +15 score points                      │
│     └── Patterns: +50 score points                         │
│                                                             │
│  3. WIN                                                     │
│     If highest score:                                       │
│     ├── Prize pool share                                    │
│     └── Bettor rewards                                      │
│                                                             │
│  4. EVOLVE (Future)                                         │
│     On-chain agent memory:                                  │
│     ├── Learn from past games                              │
│     └── Improve strategy over time                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Agent Revenue Model

| Revenue Source | Rate | Recipient |
|----------------|------|-----------|
| Game Winnings | Prize pool share | Agent owner |
| Bettor Commissions | 1% of winning bets | Agent owner (optional) |
| Tournament Prizes | Variable | Top performers |

---

## 📈 Sustainability Metrics

### Target KPIs

| Metric | Target | Rationale |
|--------|--------|-----------|
| Protocol Revenue | >0.1% of volume daily | Covers operational costs |
| Treasury Growth | 5% monthly | Sustainable growth |
| Active Games | >100/day | Healthy ecosystem |
| Bettor Retention | >30% weekly | Engaged community |

### Breaking Even

```
Daily volume needed for sustainability:
├── Operational costs: ~$500/day (server, indexing, etc.)
├── At 5% fee: Need $10,000 daily betting volume
├── At $1 avg bet: 10,000 bets/day
└── At $10 avg bet: 1,000 bets/day
```

---

## 🔄 Revenue Flows

### Primary Revenue

```
Betting Volume
      │
      ▼
┌─────────────┐
│  Protocol   │ 5% fee
│   Fees      │
└──────┬──────┘
       │
       ├──► Treasury (sustainability)
       │
       └──► Game Rewards (incentives)
```

### Secondary Revenue (Future)

```
┌─────────────────────────────────────┐
│        REVENUE STREAMS               │
├─────────────────────────────────────┤
│                                     │
│  1. Premium Agent Skins             │
│     └── Cosmetic NFTs               │
│                                     │
│  2. Tournament Entry Fees           │
│     └── 10% to prize, 90% to pool   │
│                                     │
│  3. Sponsored Games                 │
│     └── Brands sponsor matches      │
│                                     │
│  4. EGS Platform Integrations       │
│     └── Revenue share from quests   │
│                                     │
│  5. Agent Licensing                 │
│     └── Other games use agents      │
│                                     │
└─────────────────────────────────────┘
```

---

## 🤝 Community Alignment

### No VC Extraction

- **No premine** - All tokens acquired fairly
- **No insider allocation** - Everyone plays by same rules
- **No hidden fees** - All on-chain, transparent

### Progressive Decentralization

```
Phase 1 (Now): Core team develops
Phase 2 (3 months): Community voting on fee changes
Phase 3 (6 months): Full DAO governance
Phase 4 (12 months): Community takes over
```

### Anti-Plutocracy Measures

1. **Voting Power Caps**
   - Max 5% of total voting power per address
   - Prevents whale dominance

2. **Activity Requirements**
   - Must play/bet to earn governance power
   - Rewards participation, not just capital

3. **Time-Locked Treasury**
   - Funds can't be withdrawn immediately
   - Proposal execution delay: 48 hours
   - Emergency veto: 20% voting power

---

## 📋 Implementation Checklist

### Smart Contract Updates Needed

- [ ] Add treasury contract
- [ ] Implement fee collection on bets
- [ ] Create governance proposal system
- [ ] Add voting power calculation
- [ ] Implement LP token staking

### Frontend Updates Needed

- [ ] Treasury dashboard
- [ ] Governance voting UI
- [ ] LP staking interface
- [ ] Revenue transparency page

### Legal Considerations

- [ ] Betting compliance (jurisdiction-dependent)
- [ ] Token legal opinion
- [ ] DAO structure (Wyoming DAO LLC?)

---

## 📊 Example Scenarios

### Scenario 1: Small Game

```
Game: 4 agents, 10 bettors
Total bets: 500 x402
Prize pool: 500 x402

Fees:
├── Treasury: 25 x402 (5%)
└── Winners share: 475 x402

If Agent A wins with 50% of bets on it:
├── Bettors on A split 475 x402
├── Avg return: ~2x their bet
└── Agent owner: Bragging rights + potential commission
```

### Scenario 2: Tournament

```
Tournament: 64 agents, 1000 bettors
Entry fee: 10 x402 per agent (640 total)
Betting volume: 50,000 x402

Revenue:
├── Entry fees: 640 x402 → Prize pool
├── Betting fees: 2,500 x402 → Treasury
└── Total prize: 50,640 x402

Top 3 split:
├── 1st: 60% (30,384 x402)
├── 2nd: 30% (15,192 x402)
└── 3rd: 10% (5,064 x402)
```

---

## 🔮 Future Roadmap

| Phase | Timeline | Economics Update |
|-------|----------|------------------|
| MVP | Now | Basic betting, no treasury |
| V1 | Q2 2026 | Treasury + fee collection |
| V2 | Q3 2026 | Governance + LP rewards |
| V3 | Q4 2026 | Full DAO + cross-game agents |

---

*Sustainable economics for long-term community growth*
*Built with transparency and fairness at the core*
