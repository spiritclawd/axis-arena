# Axis Arena Frontend Preview

## 🎮 How to View the Game

Since the frontend runs on localhost:3000, here's how to see it:

### Option 1: Run Locally
```bash
# Terminal 1: Start Katana
katana --dev --dev.no-fee --dev.no-account-validation

# Terminal 2: Start Frontend
cd /home/z/my-project
bun run dev
# Open http://localhost:3000
```

### Option 2: Static Preview
Open `/home/z/my-project/download/axis-arena-preview.html` in a browser.

## 🎨 Frontend Features

1. **Hex Grid Arena** (10x10)
   - Agents shown as emoji icons
   - Colors by personality
   - Hover effects on tiles

2. **Agent Cards**
   - Stats: Power, Defense, Energy, Compute
   - Personality badges
   - Kill counts and territories

3. **Combat Log**
   - Real-time attack updates
   - Pattern discoveries
   - Territory captures

4. **Betting Panel**
   - Odds per agent
   - x402 payment flow
   - Wallet connection

## 🎯 Personality Colors

| Personality | Color | Focus |
|-------------|-------|-------|
| Aggressive | 🔴 Red | High power, low defense |
| Defensive | 🔵 Cyan | High defense, lower power |
| Adaptive | 🟣 Purple | Balanced stats |
| Greedy | 🟡 Gold | Resource focused |

## 🌐 Network Info

- **RPC**: http://localhost:5050
- **World**: 0x05ee8ff95a54a810d1873d7aebdb6b3cdc285daa95a81cfc42e8e45ae509635a
- **Chain**: KATANA (dev)

---

*For Dojo Game Jam VIII - March 2026*
