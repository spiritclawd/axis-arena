# Cartridge Controller Integration

> LLM Usage Guide for Axis Arena Starknet Integration
> Source: https://github.com/cartridge-gg/controller-cli/blob/main/LLM_USAGE.md

---

## Quick Install

```bash
# Install CLI
curl -fsSL https://raw.githubusercontent.com/cartridge-gg/controller-cli/main/install.sh | bash

# Add to PATH if needed
export PATH="$PATH:$HOME/.local/bin"

# Verify
controller --version
```

---

## Key Commands for Axis Arena

### 1. Check Session Status
```bash
controller session status --json
```

**Status states:**
- `no_session` - No keypair exists
- `keypair_only` - Keypair exists but no registered session  
- `active` - Session registered and not expired

### 2. Authorize Session
```bash
# Use a preset (recommended)
controller session auth \
  --preset loot-survivor \
  --chain-id SN_SEPOLIA \
  --json

# Custom expiration
controller session auth \
  --preset loot-survivor \
  --chain-id SN_MAIN \
  --expires 7days \
  --json
```

**For Axis Arena, we need a custom policy:**
```json
{
  "contracts": {
    "AXIS_ARENA_WORLD_ADDRESS": {
      "name": "Axis Arena",
      "methods": [
        { "name": "spawn_agent", "entrypoint": "spawn_agent" },
        { "name": "move_agent", "entrypoint": "move_agent" },
        { "name": "attack_agent", "entrypoint": "attack_agent" },
        { "name": "think", "entrypoint": "think" },
        { "name": "place_bet", "entrypoint": "place_bet" },
        { "name": "capture_tile", "entrypoint": "capture_tile" }
      ]
    }
  }
}
```

### 3. Execute Transactions
```bash
# Spawn an agent
controller execute \
  0xAXIS_ARENA_ADDRESS \
  spawn_agent \
  "AgentName",0 \
  --json

# Move agent
controller execute \
  0xAXIS_ARENA_ADDRESS \
  move_agent \
  1,5,3 \
  --json

# Place bet (USDC)
controller execute \
  0xAXIS_ARENA_ADDRESS \
  place_bet \
  1,1000000 \
  --json
```

### 4. Read-Only Calls
```bash
# Get agent stats
controller call \
  0xAXIS_ARENA_ADDRESS \
  get_agent \
  1 \
  --chain-id SN_SEPOLIA \
  --json

# Get game state
controller call \
  0xAXIS_ARENA_ADDRESS \
  get_game \
  1 \
  --chain-id SN_SEPOLIA \
  --json
```

### 5. Check Balances
```bash
controller balance --json
controller balance eth --json
controller balance strk --json
```

### 6. Transaction Status
```bash
controller transaction 0xTX_HASH \
  --chain-id SN_SEPOLIA \
  --wait \
  --json
```

---

## Network Configuration

| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Sepolia | `SN_SEPOLIA` | `https://api.cartridge.gg/x/starknet/sepolia` |
| Mainnet | `SN_MAIN` | `https://api.cartridge.gg/x/starknet/mainnet` |

---

## Integration Flow for Axis Arena

```
┌─────────────────────────────────────────────────────────────┐
│                    USER CONNECTS WALLET                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. Check session status                                   │
│      controller session status --json                       │
│                                                             │
│   2. If no session, generate auth URL                       │
│      controller session auth --file policy.json             │
│                                                             │
│   3. Display short_url to user                              │
│      → User authorizes in browser                           │
│                                                             │
│   4. Session active, execute game actions                   │
│      controller execute <world> <action> <args>             │
│                                                             │
│   5. Read game state                                        │
│      controller call <world> get_game <id>                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Available Presets

| Preset | Description |
|--------|-------------|
| `loot-survivor` | Loot Survivor game |
| `influence` | Influence game |
| `realms` | Realms game |
| `pistols` | Pistols game |
| `dope-wars` | Dope Wars game |

For Axis Arena, we may need to create a custom preset or policy file.

---

## Explorer Links

- **Mainnet:** `https://voyager.online/tx/0x...`
- **Sepolia:** `https://sepolia.voyager.online/tx/0x...`

---

*Fetched: 2026-03-06*
