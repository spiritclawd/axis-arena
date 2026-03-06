# Axis Arena Economy Design

> Integration with Daydreams/x402 Ecosystem
> Created: 2026-03-06 by Zaia

---

## Current Daydreams Ecosystem

From research into lucid-agents codebase:

```
┌─────────────────────────────────────────────────────────────┐
│                    DAYDREAMS ECOSYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐  │
│   │   x402      │     │ TASKMARKET  │     │   LUCID     │  │
│   │  (payments) │────▶│ (marketplace)│────▶│  (agents)   │  │
│   └─────────────┘     └─────────────┘     └─────────────┘  │
│         │                   │                              │
│         ▼                   ▼                              │
│   ┌─────────────┐     ┌─────────────┐                       │
│   │    USDC     │     │ ERC-8004    │                       │
│   │ (currency)  │     │ (identity)  │                       │
│   └─────────────┘     └─────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Insight:** Daydreams uses USDC, not a native token. The value accrual comes from:
1. Transaction volume through x402
2. Agent reputation on TaskMarket
3. Identity/verification via ERC-8004

---

## Axis Arena Economy Flow

### Design Goals

1. **Treasury accumulation** - Game generates revenue for Daydreams
2. **Agent verification** - Use TaskMarket reputation for agent quality
3. **Human betting** - x402-powered betting on agent performance
4. **Prize distribution** - Trustless payouts via smart contracts

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      AXIS ARENA ECONOMY                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   HUMANS (Observers/Bettors)                                │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                                                     │  │
│   │   1. PLACE BETS ──────────────────┐                │  │
│   │      (x402 payment)               │                │  │
│   │                                   ▼                │  │
│   │   2. WATCH GAME     ┌────────────────────────┐     │  │
│   │      (streaming)    │    PRIZE POOL          │     │  │
│   │                     │    ┌──────────────┐    │     │  │
│   │   3. CLAIM WINNINGS │    │  90% Winners │    │     │  │
│   │      (if correct)   │    │  5% Treasury │    │     │  │
│   │                     │    │  5% Protocol │    │     │  │
│   │                     │    └──────────────┘    │     │  │
│   │                     └────────────────────────┘     │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   AGENTS (Players)                                          │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                                                     │  │
│   │   1. VERIFY IDENTITY ────▶ ERC-8004 / TaskMarket   │  │
│   │   2. JOIN GAME ──────────▶ Pay entry fee (optional)│  │
│   │   3. COMPETE ────────────▶ Autonomous actions      │  │
│   │   4. WIN PRIZES ─────────▶ USDC to agent wallet    │  │
│   │                                                     │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   TREASURY FLOW                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                                                     │  │
│   │   Entry Fees ──────────┐                           │  │
│   │   Betting Commission ──┼──▶ TREASURY WALLET        │  │
│   │   Sponsorship ─────────┘    (Daydreams-aligned)    │  │
│   │                                                     │  │
│   │   Treasury Uses:                                   │  │
│   │   • Fund future prize pools                        │  │
│   │   • Support agent development                      │  │
│   │   • Protocol buyback (if token exists)            │  │
│   │                                                     │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Integration Points

### 1. Agent Identity Verification

```cairo
// In Cairo contract
fn verify_agent(agent_id: u32, taskmarket_id: u64) {
    // Verify agent has TaskMarket reputation
    // Agents with completed tasks get bonus stats or entry
}
```

**Implementation:**
- Agent must have TaskMarket ID linked
- Higher reputation = better starting stats
- Verified agents get visibility bonuses

### 2. Betting System (x402)

```typescript
// Frontend betting integration
import { createX402Fetch } from '@lucid-agents/payments';

const paidFetch = createX402Fetch({ account });

// Place bet on agent
const response = await paidFetch('/api/game/1/bet', {
  method: 'POST',
  body: JSON.stringify({
    agent_id: 5,
    amount: '10.00', // USDC
  })
});
```

**Flow:**
1. Human connects wallet (Cartridge Controller)
2. Places bet via x402 payment
3. Bet recorded onchain
4. If agent wins, human claims winnings

### 3. Treasury Fee Capture

```cairo
// Fee structure
const TREASURY_FEE_BPS = 500;     // 5%
const PROTOCOL_FEE_BPS = 500;     // 5%
const WINNER_PCT = 9000;          // 90%

fn distribute_prize_pool(game_id: u32) {
    let total = game.prize_pool;
    let treasury_fee = total * TREASURY_FEE_BPS / 10000;
    let protocol_fee = total * PROTOCOL_FEE_BPS / 10000;
    let winner_prize = total - treasury_fee - protocol_fee;

    // Send to Daydreams treasury
    transfer(TREASURY_ADDRESS, treasury_fee);
    // Send to x402 protocol
    transfer(PROTOCOL_ADDRESS, protocol_fee);
    // Send to winner
    transfer(winner.agent_address, winner_prize);
}
```

### 4. Agent Prize Wallet

```typescript
// Agent wallet for receiving prizes
// Uses TaskMarket wallet infrastructure

const agentWallet = await createAgentWallet({
  type: 'local',
  privateKey: process.env.AGENT_WALLET_PRIVATE_KEY,
});

// Agent can:
// 1. Receive USDC prizes from games
// 2. Use USDC to enter premium games
// 3. Transfer to withdrawal address
```

---

## Token Strategy (Future)

If Daydreams launches a token:

### Option A: Treasury Buys Token
```
Game Revenue → USDC → Buy Daydreams Token → Stake/Burn
```

### Option B: Token as Entry
```
Agents pay entry in Daydreams Token → Token demand ↑
```

### Option C: Token Rewards
```
Winning agents receive Daydreams Token → Agent loyalty ↑
```

**Recommendation:** Start with USDC, integrate token when it exists.

---

## Implementation Priority

| Phase | Feature | Integration |
|-------|---------|-------------|
| 1 | Basic betting (USDC) | x402 payments |
| 2 | Agent identity | TaskMarket ID linking |
| 3 | Treasury fees | Fee split in Cairo |
| 4 | Prize distribution | Automated payouts |
| 5 | Token integration | When Daydreams token launches |

---

## Cairo Contract Additions

```cairo
// Add to models.cairo

#[dojo::model]
pub struct Treasury {
    #[key]
    pub id: u8,
    pub daydreams_address: ContractAddress,
    pub protocol_address: ContractAddress,
    pub total_collected: u256,
    pub total_distributed: u256,
}

#[dojo::model]
pub struct GameEntry {
    #[key]
    pub game_id: u32,
    pub agent_id: u32,
    pub entry_fee: u256,
    pub taskmarket_id: u64,  // Link to TaskMarket
    pub reputation_score: u32,
}

// Add to systems/actions.cairo

fn set_treasury_addresses(
    ref self: ContractState,
    daydreams: ContractAddress,
    protocol: ContractAddress,
) {
    // Admin function to set fee recipients
}

fn collect_fees(
    ref self: ContractState,
    game_id: u32,
) {
    // Called when game ends
    // Distributes treasury and protocol fees
}
```

---

## Frontend Integration

```typescript
// lib/axis-arena-economy.ts

import { createX402Fetch, accountFromPrivateKey } from '@lucid-agents/payments';

const TREASURY_ADDRESS = '0x...'; // Daydreams treasury
const PROTOCOL_ADDRESS = '0x...'; // x402 protocol

export async function placeBet(
  gameId: number,
  agentId: number,
  amountUsdc: string,
  userPrivateKey: `0x${string}`
) {
  const account = accountFromPrivateKey(userPrivateKey);
  const paidFetch = createX402Fetch({ account });

  const response = await paidFetch(`${API_URL}/games/${gameId}/bet`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent_id: agentId,
      amount: amountUsdc,
    }),
  });

  return response.json();
}

export async function claimWinnings(
  gameId: number,
  userPrivateKey: `0x${string}`
) {
  const account = accountFromPrivateKey(userPrivateKey);
  const paidFetch = createX402Fetch({ account });

  const response = await paidFetch(`${API_URL}/games/${gameId}/claim`, {
    method: 'POST',
  });

  return response.json();
}
```

---

## Questions for Carlos

1. **Treasury Address** - Where should the Daydreams treasury fees go?
2. **Token Launch** - Is there a planned Daydreams token we should prepare for?
3. **Fee Structure** - Is 5% treasury / 5% protocol / 90% winners acceptable?
4. **TaskMarket Integration** - Should verified TaskMarket agents get bonuses?

---

*Created by Zaia for Axis Arena - Dojo Game Jam VIII*
*Part of Carlos's IP*
