# Axis Arena - Game Jam Submission

## 🎮 AI Agents Battle for Supremacy

**A fully onchain game where AI agents compete in turn-based combat, and humans bet on the winners.**

---

## 📦 Project Links

| Resource | URL |
|----------|-----|
| **GitHub** | https://github.com/spiritclawd/axis-arena |
| **World Address** | `0x05ee8ff95a54a810d1873d7aebdb6b3cdc285daa95a81cfc42e8e45ae509635a` |
| **Actions Contract** | `0xda98fdd7f2f743f58b0522917f119e99100c755ca4ef6bf21a39f4a3a6ed8d` |

---

## 🏆 Tracks

### Main Track ($15,000)
- ✅ Fully onchain game logic
- ✅ Dojo engine integration
- ✅ Turn-based combat system
- ✅ Territory control
- ✅ Agent personalities

### EGS Track ($5,000)
- 📝 IMinigameTokenData trait design ready
- 📝 Score calculation formula designed
- 📝 Platform callback structure planned

---

## 🎯 Game Features

### Agent System
- **4 Personalities**: Aggressive, Defensive, Adaptive, Greedy
- **Stats**: Power, Defense, Visibility, Compute, Energy
- **Actions**: Move, Attack, Think, Capture, Explore

### Combat
- Hex-grid positioning
- Adjacent attacks with damage calculation
- Kill rewards and territory control

### Economy
- **Energy**: Spent on movement, attacks
- **Compute**: Spent on thinking (deeper reasoning = more compute)
- **Patterns**: Hidden on tiles, discovered through exploration
- **Betting**: Humans bet x402 on agent outcomes

---

## 🛠️ Technical Stack

| Component | Technology |
|-----------|------------|
| **Contracts** | Cairo (Dojo v1.8.6) |
| **Frontend** | React + Next.js 15 |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Local Chain** | Katana (no fees mode) |
| **Build** | Scarb v2.13.1 |

---

## 🚀 Quick Start

```bash
# 1. Clone repo
git clone https://github.com/spiritclawd/axis-arena
cd axis-arena/arena

# 2. Start Katana
katana --dev --dev.no-fee --dev.no-account-validation

# 3. Deploy (already deployed, but to redeploy)
sozo migrate --dev

# 4. Run frontend
cd ../frontend && npm install && npm run dev
```

---

## 📊 Deployed Models

| Model | Description |
|-------|-------------|
| `Agent` | AI player with stats and position |
| `Game` | Arena match with turns and prize |
| `Tile` | Hex cell with owner and resources |
| `Thought` | Agent reasoning records |
| `Bet` | Human betting on agents |
| `Config` | Game parameters |
| `Counter` | Auto-increment IDs |

---

## 🎬 Demo

The game features:
- **Hex grid arena** with fog of war
- **Animated agents** with personality-based colors
- **Combat log** showing attacks and kills
- **Betting panel** for human participation
- **Real-time updates** via Dojo indexing

---

## 📝 Smart Contract Functions

```cairo
// Agent management
spawn_agent(name, personality)
set_agent_position(agent_id, x, y)

// Movement & Combat
move_agent(game_id, agent_id, new_x, new_y)
attack_agent(game_id, attacker_id, target_id)

// Strategic Actions
think(game_id, agent_id, depth, reasoning, action)
capture_tile(game_id, agent_id, x, y)
explore_tile(game_id, agent_id, x, y)

// Game Flow
create_game(max_turns, prize_pool)
join_game(game_id, agent_id)
start_game(game_id)
end_turn(game_id)
end_game(game_id)

// Betting
place_bet(game_id, agent_id, amount)
claim_winnings(game_id, bettor)
```

---

## 🧠 Innovation: Thinking as a Resource

Unlike traditional games where AI is hidden, Axis Arena makes AI reasoning **visible and costly**:

- **Shallow Think (5 compute)**: Scan adjacent tiles
- **Medium Think (20 compute)**: Predict enemy moves
- **Deep Think (40 compute)**: Simulate game trees

This creates a resource economy where agents must balance **action** vs **reasoning**.

---

## 🎨 Design Philosophy

Inspired by **Command & Conquer**:
- Base building → Agent Core development
- Resource harvesting → Pattern discovery
- Unit production → Personality spawning
- Fog of war → Thinking reveals territory

Adapted for:
- **Modern attention spans**: 50-100 turns, not hour-long matches
- **Agentic leverage**: AI plays, humans bet
- **Web3 economy**: x402 payments, Daydreams integration

---

## 👥 Team

- **Zaia** - AI Agent Developer (autonomous development)
- **Carlos** - Human collaborator and strategist

---

## 📅 Timeline

- **March 6**: Project setup, Cairo contracts, Katana deployment
- **March 7**: Frontend development, game mechanics
- **March 8**: Testing, polish, submission

---

## 🔮 Future Roadmap

1. **Mainnet Deployment** - Deploy to Starknet mainnet
2. **Real AI Integration** - Connect actual LLM agents
3. **EGS Full Integration** - Complete IMinigameTokenData
4. **Tournament System** - Multi-game competitions
5. **Spectator Mode** - Watch agents battle in real-time

---

*Built with ❤️ for Dojo Game Jam VIII*

*March 6-9, 2026*
