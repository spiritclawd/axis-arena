# Axis Arena - Vercel Deployment Guide

> 🚀 Deploy your AI agent battle arena to Vercel for the world to see!

## 📋 Prerequisites

- [ ] GitHub account with fork of [spiritclawd/axis-arena](https://github.com/spiritclawd/axis-arena)
- [ ] Vercel account (free tier works)
- [ ] Dojo Slot deployment (for mainnet)
- [ ] Cartridge Controller for wallet integration

---

## 🏗️ Step 1: Fork the Repository

1. Go to https://github.com/spiritclawd/axis-arena
2. Click **Fork** in the top right
3. Select your account as the destination
4. Wait for fork to complete

---

## 🌐 Step 2: Create Vercel Project

### Option A: Import from GitHub (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New...** → **Project**
3. Select **Import Git Repository**
4. Find your forked `axis-arena` repository
5. Click **Import**

### Option B: Use Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Clone your fork
git clone https://github.com/YOUR_USERNAME/axis-arena.git
cd axis-arena

# Deploy
vercel
```

---

## ⚙️ Step 3: Configure Environment Variables

In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_NETWORK` | `mainnet` | Network mode |
| `NEXT_PUBLIC_DOJO_RPC_URL` | Your Katana RPC URL | From Slot deployment |
| `NEXT_PUBLIC_DOJO_TORII_URL` | Your Torii URL | From Slot deployment |
| `NEXT_PUBLIC_DOJO_RELAY_URL` | Your Relay URL | From Slot deployment |
| `NEXT_PUBLIC_WORLD_ADDRESS` | `0x...` | World contract address |

### Getting Slot URLs

After deploying to Slot:

1. Go to your Slot dashboard
2. Find your deployed project
3. Copy the endpoints:
   - **Katana RPC**: `https://api.katana.slot-YOUR-ID.herokuapp.com`
   - **Torii**: `https://api.torii.slot-YOUR-ID.herokuapp.com`
   - **Relay**: From the P2P configuration

---

## 🔧 Step 4: Build Settings

Vercel should auto-detect Next.js, but verify:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Build Command** | `bun run build` |
| **Output Directory** | `.next` |
| **Install Command** | `bun install` |

---

## 🚀 Step 5: Deploy!

1. Click **Deploy** in Vercel
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at `https://your-project.vercel.app`

---

## 📦 Deploying Contracts to Mainnet

### Prerequisites

```bash
# Install Dojo toolchain
curl -L https://install.dojo-engine.org | bash
source ~/.bashrc

# Install Scarb (Cairo package manager)
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
```

### Deploy to Slot

```bash
# Login to Slot
sozo auth

# Create a new Slot project
slot deployments create axis-arena

# Build contracts
cd arena
sozo build

# Deploy to mainnet
sozo migrate --network mainnet

# Note the World Address from output
# Example: World Address: 0x1234...abcd
```

### Update Environment Variables

After deployment, update Vercel environment variables with the new World Address and URLs.

---

## 🎮 Testing Your Deployment

1. **Visit your Vercel URL**
2. **Connect wallet** using Cartridge Controller
3. **Create a game** by clicking "Enter Arena"
4. **Spawn agents** with different personalities
5. **Watch AI battles** unfold in real-time!

---

## 🔄 Updating Your Deployment

When you push changes to your fork's main branch, Vercel auto-deploys:

```bash
# Make changes locally
git add .
git commit -m "feat: new feature"
git push origin main

# Vercel automatically redeploys!
```

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Check for TypeScript errors locally
bun run lint

# Try a local build
bun run build
```

### Environment Variables Not Applied

- Redeploy after changing env vars
- Check they start with `NEXT_PUBLIC_`
- Verify in Vercel dashboard → Settings → Environment Variables

### Dojo Connection Issues

- Verify WORLD_ADDRESS matches your deployed world
- Check Torii URL is accessible
- Ensure network matches (mainnet vs localhost)

### Wallet Connection Issues

- Ensure Cartridge Controller is installed
- Check you're on the correct network
- Try clearing browser cache

---

## 📊 Monitoring

### Vercel Analytics

1. Go to your project in Vercel
2. Enable **Analytics** tab
3. View real-time visitor data

### Error Tracking

Add Sentry for error tracking:

```bash
bun add @sentry/nextjs
```

Then set `NEXT_PUBLIC_SENTRY_DSN` in Vercel.

---

## 🎬 Demo Video Checklist

For your Game Jam submission video:

- [ ] Show landing page with hero section
- [ ] Connect wallet with Cartridge Controller
- [ ] Create a new game
- [ ] Spawn AI agents with different personalities
- [ ] Watch agents battle and make decisions
- [ ] Show real-time combat log
- [ ] Display final scores and winner
- [ ] Explain the EGS token implementation

---

## 🏆 Game Jam Submission

Your project is eligible for:

| Track | Prize | Status |
|-------|-------|--------|
| Main Track | $15,000 | ✅ Ready |
| EGS Track | $5,000 | ✅ Ready |

**Submission URL**: `https://your-project.vercel.app`

---

## 📞 Support

- **Dojo Discord**: [discord.gg/dojoengine](https://discord.gg/dojoengine)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Project Issues**: [GitHub Issues](https://github.com/spiritclawd/axis-arena/issues)

---

**Built for Dojo Game Jam VIII** 🎮

*AI Agents Battle for Supremacy*
