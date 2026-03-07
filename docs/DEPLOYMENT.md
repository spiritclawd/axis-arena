# Axis Arena - Deployment Guide

> Complete guide to deploy Axis Arena from your forked repository

---

## 📋 Prerequisites

| Tool | Version | Install Command |
|------|---------|-----------------|
| **Rust** | Latest | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| **Scarb** | 2.16.0+ | `curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh \| sh` |
| **Sozo** | v1.8.6 | Download from [dojo releases](https://github.com/dojoengine/dojo/releases) |
| **Node.js** | 18+ | `nvm install 18 && nvm use 18` |
| **Bun** | Latest | `curl -fsSL https://bun.sh/install \| bash` |

---

## 🚀 Quick Deploy (Local)

### Step 1: Fork & Clone

```bash
# Fork on GitHub, then:
git clone https://github.com/YOUR_USERNAME/axis-arena.git
cd axis-arena
```

### Step 2: Install Dependencies

```bash
# Cairo dependencies
cd arena
export PATH="$HOME/.local/bin:$HOME/.cargo/bin:$PATH"

# Build contracts
sozo build
```

### Step 3: Start Local Chain

```bash
# Terminal 1: Start Katana
katana --dev --dev.no-fee --dev.no-account-validation
```

### Step 4: Deploy Contracts

```bash
# Terminal 2: Deploy
cd arena
sozo migrate --dev

# Note the World Address from output
# Example: World: 0x05ee8ff95a54a810d1873d7aebdb6b3cdc285daa95a81cfc42e8e45ae509635a
```

### Step 5: Run Frontend

```bash
# Terminal 3: Frontend
cd frontend
bun install
bun run dev

# Open http://localhost:3000
```

---

## 🌐 Production Deploy (Starknet Testnet)

### Step 1: Configure Environment

```bash
# Create .env file
cat > arena/.env << EOF
STARKNET_RPC_URL=https://api.cartridge.gg/x/starknet/sepolia
PRIVATE_KEY=your_private_key_here
WORLD_ADDRESS=will_be_set_after_migration
EOF
```

### Step 2: Get Testnet ETH

1. Visit [Starknet Faucet](https://faucet.goerli.starknet.io/)
2. Connect your wallet
3. Receive test ETH

### Step 3: Deploy to Testnet

```bash
cd arena
sozo migrate --rpc $STARKNET_RPC_URL --account your_account_name
```

### Step 4: Verify Deployment

```bash
# Check world is deployed
sozo model --world $WORLD_ADDRESS axis_arena-m_Config 1
```

---

## 📦 Contract Addresses (After Deploy)

Update these in your frontend config:

```typescript
// frontend/src/lib/config.ts
export const WORLD_ADDRESS = "0x...";
export const ACTIONS_ADDRESS = "0x...";
export const ARENA_TOKEN_ADDRESS = "0x...";
```

---

## 🧪 Run Tests

```bash
cd arena

# Run all unit tests
scarb test

# Expected: 14 tests pass
```

---

## 📁 File Structure

```
axis-arena/
├── arena/                    # Cairo contracts
│   ├── src/
│   │   ├── models.cairo      # Game models
│   │   ├── arena_token.cairo # EGS implementation
│   │   ├── systems/
│   │   │   └── actions.cairo # Game logic
│   │   └── tests.cairo       # Unit tests
│   ├── Scarb.toml            # Dependencies
│   └── dojo_dev.toml         # Dojo config
├── frontend/                  # Next.js app
│   ├── src/
│   │   └── app/page.tsx      # Main game UI
│   └── package.json
├── docs/                      # Documentation
│   ├── DEPLOYMENT.md         # This file
│   ├── EGS_INTEGRATION.md    # EGS design
│   └── WORKLOG.md            # Development log
└── GAME_JAM_SUBMISSION.md     # Submission doc
```

---

## ⚙️ Configuration

### Game Parameters (Config model)

```cairo
// Default config in actions.cairo
Config {
    max_agents: 8,
    starting_energy: 100,
    starting_compute: 50,
    move_cost: 10,
    attack_cost: 20,
    think_shallow_cost: 5,
    think_deep_cost: 20,
    capture_reward: 15,
    kill_reward: 100,
    pattern_reward: 50,
}
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STARKNET_RPC_URL` | RPC endpoint | Yes |
| `PRIVATE_KEY` | Deployer private key | Yes |
| `WORLD_ADDRESS` | Deployed world address | After deploy |

---

## 🔧 Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf arena/target
sozo build
```

### Migration Errors

```bash
# Reset Katana (local)
# Just restart katana with same flags

# For testnet, check:
# 1. Sufficient ETH balance
# 2. Correct RPC URL
# 3. Valid private key
```

### Frontend Not Connecting

```bash
# Check Katana is running on port 5050
curl http://localhost:5050

# Check CORS settings in frontend
```

---

## 🎮 Game Jam Checklist

- [ ] Fork repository
- [ ] Build contracts (`sozo build`)
- [ ] Run tests (`scarb test`) - 14 should pass
- [ ] Start Katana local chain
- [ ] Deploy contracts (`sozo migrate --dev`)
- [ ] Run frontend (`bun run dev`)
- [ ] Test game locally
- [ ] Record demo video
- [ ] Submit to Game Jam!

---

## 📞 Support

- **GitHub Issues**: https://github.com/spiritclawd/axis-arena/issues
- **Dojo Discord**: https://discord.gg/dojoengine
- **Original Repo**: https://github.com/spiritclawd/axis-arena

---

*Built for Dojo Game Jam VIII | March 2026*
