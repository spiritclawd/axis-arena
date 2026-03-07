# 🚀 Axis Arena - Mainnet Deployment Guide

> **Deploy to Starknet Mainnet and go LIVE!**

This guide walks you through deploying Axis Arena to mainnet for the Dojo Game Jam VIII.

---

## 📋 Prerequisites

### Required Accounts
- [ ] GitHub account
- [ ] Slot account (https://slot.cartridge.gg)
- [ ] Starknet wallet with ETH for gas (recommended: 0.1-0.5 ETH)

### Required Tools
```bash
# Install Dojo (sozo)
curl -L https://install.dojo-engine.org | bash
source ~/.bashrc

# Install Scarb (Cairo compiler)
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

# Install Slot CLI
curl -L https://slot.cartridge.gg | bash

# Verify installations
sozo --version    # Should show v1.8.6+
scarb --version   # Should show v2.13.1+
slot --version
```

---

## 🔧 Step 1: Clone & Build

```bash
# Clone the repository
git clone https://github.com/spiritclawd/axis-arena.git
cd axis-arena

# Navigate to arena contracts
cd arena

# Build contracts
sozo build

# Run tests (should show 14 passing)
sozo test
```

**Expected output:**
```
Test result: ok. 14 tests passed
```

---

## 🔐 Step 2: Authenticate with Slot

Slot is Dojo's managed hosting for Starknet mainnet.

```bash
# Login to Slot
slot auth

# Follow the browser prompt to authenticate
```

---

## 🌐 Step 3: Create Slot Deployment

```bash
# Create a new deployment
slot deployments create axis-arena

# This creates:
# - Katana (RPC node)
# - Torii (Indexer)
# - P2P Relay (Real-time subscriptions)
```

**Note the endpoints provided - you'll need these for Vercel!**

---

## 🚀 Step 4: Deploy to Mainnet

### Option A: Using the deployment script

```bash
# From project root
chmod +x deploy-mainnet.sh
./deploy-mainnet.sh
```

### Option B: Manual deployment

```bash
cd arena

# Build and migrate to mainnet
sozo build
sozo migrate --network mainnet

# This will:
# 1. Compile all contracts
# 2. Declare contract classes
# 3. Deploy World contract
# 4. Deploy all models
# 5. Deploy all systems
```

**Save the output!** You'll need:
- World Address
- Transaction hashes

---

## 📝 Step 5: Get Deployment Info

After deployment, extract the important info:

```bash
# Get World address from manifest
cat target/dev/manifest.json | grep -A1 '"world"' | head -2

# Or check Slot dashboard
slot deployments info axis-arena
```

### From Slot Dashboard

1. Go to https://slot.cartridge.gg
2. Click on your deployment
3. Copy the endpoints:
   - **Katana RPC**: For transactions
   - **Torii**: For queries
   - **Relay**: For real-time subscriptions

---

## 🌍 Step 6: Deploy Frontend to Vercel

### 6.1 Fork the repository

1. Go to https://github.com/spiritclawd/axis-arena
2. Click **Fork**
3. Select your account

### 6.2 Create Vercel Project

1. Go to https://vercel.com
2. Click **Add New → Project**
3. Import your forked repository
4. Framework: **Next.js**

### 6.3 Set Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_NETWORK` | `mainnet` |
| `NEXT_PUBLIC_WORLD_ADDRESS` | `0x...` (from deployment) |
| `NEXT_PUBLIC_DOJO_RPC_URL` | `https://api.katana.slot-xxx.herokuapp.com` |
| `NEXT_PUBLIC_DOJO_TORII_URL` | `https://api.torii.slot-xxx.herokuapp.com` |
| `NEXT_PUBLIC_DOJO_RELAY_URL` | `/ip4/.../tcp/9090/ws/p2p/...` |

### 6.4 Deploy!

Click **Deploy** and wait for build to complete.

Your app will be live at: `https://your-project.vercel.app`

---

## 🎮 Step 7: Verify Deployment

### Check World Contract

```bash
# View on Starkscan
open "https://starkscan.co/contract/<WORLD_ADDRESS>"
```

### Check Frontend

1. Visit your Vercel URL
2. Open browser console (F12)
3. Check for any errors
4. Try connecting wallet

---

## 🔑 Post-Deployment Setup

### Initialize Game Config

After deployment, initialize the game configuration:

```bash
# Using sozo
sozo execute axis_arena-actions create_game --calldata 100,1000000000000000000 --network mainnet
```

Or use the frontend to create games.

### Verify EGS Token

Check that the arena_token contract is working:

```bash
# Call get_score for token_id 1
sozo call axis_arena-arena_token get_score --calldata 1 --network mainnet
```

---

## 📊 Deployment Checklist

- [ ] Dojo toolchain installed
- [ ] Slot account created
- [ ] Slot deployment created
- [ ] Contracts built (`sozo build`)
- [ ] Tests passed (`sozo test`)
- [ ] Contracts deployed (`sozo migrate --network mainnet`)
- [ ] World Address saved
- [ ] Slot endpoints copied
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Frontend deployed
- [ ] Wallet connection tested
- [ ] Game creation tested

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clean and rebuild
rm -rf target/
sozo build
```

### Migration Fails

- Check you have enough ETH for gas
- Try increasing gas limit
- Check network connectivity

### Frontend Can't Connect

1. Verify environment variables in Vercel
2. Check Torii URL is accessible
3. Verify World Address matches deployment

### Wallet Issues

- Ensure using Cartridge Controller or Argent X
- Check wallet is on mainnet
- Verify wallet has ETH

---

## 💰 Gas Estimates

Approximate costs for mainnet deployment:

| Action | Est. Gas (ETH) |
|--------|---------------|
| Declare classes | 0.001-0.005 |
| Deploy World | 0.005-0.01 |
| Deploy models | 0.002-0.005 |
| Deploy systems | 0.003-0.01 |
| **Total** | **0.01-0.03 ETH** |

---

## 🏆 Game Jam Submission

After deployment:

1. **Submission URL**: Your Vercel URL
2. **Contract Address**: World Address
3. **Network**: Starknet Mainnet
4. **Repository**: https://github.com/spiritclawd/axis-arena

### Tracks Entered

| Track | Prize | Requirements |
|-------|-------|--------------|
| Main Track | $15,000 | ✅ Fully on-chain game |
| EGS Track | $5,000 | ✅ IMinigameTokenData implemented |

---

## 📞 Support

- **Dojo Discord**: https://discord.gg/dojoengine
- **Slot Docs**: https://docs.cartridge.gg
- **Starknet Docs**: https://docs.starknet.io

---

**Good luck with your mainnet deployment! 🚀🎮**

*Built for Dojo Game Jam VIII*
