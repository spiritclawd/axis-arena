# Command & Conquer → Axis Arena Adaptation Guide

> **Purpose**: Analyze C&C game mechanics and identify elements to adapt for our AI agent battle game
> **Author**: Zaia (spiritclawd)
> **Date**: March 2026

---

## 1. C&C Core Mechanics Analysis

### 1.1 Base Building Systems

Command & Conquer pioneered several base building approaches that remain influential:

| Mechanic | Description | Agentic Adaptation Potential |
|----------|-------------|------------------------------|
| **MCV (Mobile Construction Vehicle)** | Start with a mobile base that deploys into a Construction Yard | Agents spawn with a "Core" that becomes their central processing hub |
| **Construction Queue** | Linear building production with dependencies | Agent skill trees with unlockable capabilities |
| **Power Grid** | Buildings consume/produce power, affecting efficiency | Compute resources - agents balance processing power vs. actions |
| **Base Crawling** | Expand by placing buildings adjacent to existing ones | Territory expansion mechanics - agents claim tiles in patterns |
| **Defense Structures** | Turrets, walls, and defensive emplacements | Agents can build "process shields" and "firewall tiles" |

**Key Insight**: C&C's base building creates **strategic investment decisions** - each building represents a choice between immediate power and long-term capability.

### 1.2 Resource Management

C&C uses multiple resource types that create interesting trade-offs:

| Resource | C&C Role | Agentic Equivalent |
|----------|----------|-------------------|
| **Tiberium/Ore** | Primary income, harvested by units | Data Patterns - discovered through exploration |
| **Credits** | Currency for production | Energy - spent on actions |
| **Power** | Building efficiency multiplier | Compute - enables deeper reasoning |
| **Veterancy** | Unit experience bonuses | Agent reputation/score multipliers |

**Adaptation Idea**: Instead of harvesting, AI agents **discover** resources by:
- Exploring tiles (pattern discovery)
- Winning combats (data extraction from defeated agents)
- Controlling territory (passive resource generation)

### 1.3 Unit Types & Counter System

C&C's rock-paper-scissors unit balance creates tactical depth:

| C&C Unit Type | Counter | Agentic Adaptation |
|---------------|---------|-------------------|
| **Infantry** | Anti-infantry, crushing | Light agents - fast, low power, high compute |
| **Tanks** | Anti-tank, air | Heavy agents - slow, high power, low compute |
| **Aircraft** | Anti-air, missiles | Scout agents - high visibility, no defense |
| **Artillery** | Fast units, air | Strategic agents - long range, fragile |

**Novel Concept**: Agent **Personalities** determine their "unit type":
- **Aggressive** (Tank-like): High power, low compute, direct combat focus
- **Defensive** (Fortress-like): High defense, medium compute, territory control
- **Adaptive** (Versatile): Balanced stats, can shift strategies
- **Greedy** (Harvester-like): High exploration bonus, low combat, resource focus

### 1.4 Fog of War & Vision

C&C's fog of war creates information asymmetry:

| Aspect | C&C Implementation | Agentic Implementation |
|--------|-------------------|----------------------|
| **Explored Areas** | Show terrain, hide enemies | Discovered patterns visible |
| **Visible Range** | Unit-based vision radius | Agent "visibility" stat |
| **Shroud** | Completely hidden areas | Undiscovered territory |
| **Radar** | Minimap overview | Agent's mental map of game state |

**Unique Twist**: AI agents can "think" to expand their vision - spending compute to simulate possible enemy positions or deduce hidden patterns.

### 1.5 Tech Trees & Upgrades

C&C's progression system through building dependencies:

```
Construction Yard → Power Plant → Barracks → Infantry
                              → Refinery → Harvesters
                 → Tiberium Silos
```

**Agentic Tech Tree**:
```
Agent Core → Compute Module → Deep Thinking (ability)
                            → Pattern Recognition (bonus)
         → Defense Matrix → Shield Tiles (territory)
                          → Firewall (anti-attack)
         → Attack Subroutines → Enhanced Power (damage)
                              → Speed Boost (mobility)
```

---

## 2. Adapted Mechanics for Axis Arena

### 2.1 Proposed New Models

Based on C&C analysis, here are new models to add:

#### 2.1.1 Structure Model (Base Building)

```cairo
#[dojo::model]
pub struct Structure {
    #[key]
    pub id: u32,
    pub owner_agent_id: u32,
    pub game_id: u32,
    pub structure_type: u8,  // 0=core, 1=compute, 2=defense, 3=attack
    pub x: u32,
    pub y: u32,
    pub level: u8,
    pub health: u32,
    pub production_rate: u32,  // Resources per turn
    pub active: bool,
}
```

#### 2.1.2 Resource Model

```cairo
#[dojo::model]
pub struct Resource {
    #[key]
    pub game_id: u32,
    pub x: u32,
    pub y: u32,
    pub resource_type: u8,  // 0=data, 1=energy, 2=compute_boost
    pub amount: u32,
    pub harvested: bool,
    pub respawn_turn: u32,
}
```

#### 2.1.3 Upgrade Model

```cairo
#[dojo::model]
pub struct Upgrade {
    #[key]
    pub agent_id: u32,
    pub upgrade_type: u8,  // 0=power, 1=defense, 2=visibility, 3=compute
    pub level: u8,
    pub cost: u32,
}
```

### 2.2 New Systems

#### 2.2.1 Structure System

```cairo
// Build a structure at location
fn build_structure(
    ref self: ContractState,
    game_id: u32,
    agent_id: u32,
    structure_type: u8,
    x: u32,
    y: u32,
);

// Upgrade a structure
fn upgrade_structure(
    ref self: ContractState,
    game_id: u32,
    structure_id: u32,
);

// Destroy a structure (when captured by enemy)
fn destroy_structure(
    ref self: ContractState,
    game_id: u32,
    structure_id: u32,
);
```

#### 2.2.2 Resource System

```cairo
// Harvest resources from a tile
fn harvest_resource(
    ref self: ContractState,
    game_id: u32,
    agent_id: u32,
    x: u32,
    y: u32,
);

// Passive resource collection from structures
fn collect_passive_resources(
    ref self: ContractState,
    game_id: u32,
    agent_id: u32,
);
```

#### 2.2.3 Upgrade System

```cairo
// Purchase an upgrade
fn purchase_upgrade(
    ref self: ContractState,
    game_id: u32,
    agent_id: u32,
    upgrade_type: u8,
);
```

---

## 3. Novel "Agentic" Twists

### 3.1 Thinking as a Resource

Unlike C&C where resources are external (Tiberium), AI agents generate value through **thinking**:

| Thinking Type | Cost | Benefit |
|--------------|------|---------|
| **Shallow (Depth 1-2)** | 5-10 compute | Scan adjacent tiles |
| **Medium (Depth 3)** | 20 compute | Predict enemy moves |
| **Deep (Depth 4-5)** | 40 compute | Simulate entire game trees |

### 3.2 Agent-to-Agent Communication

A unique mechanic for AI agents - they can share information:

```cairo
fn share_intel(
    ref self: ContractState,
    game_id: u32,
    from_agent_id: u32,
    to_agent_id: u32,
    intel_type: u8,  // 0=enemy_pos, 1=resource_loc, 2=pattern_hint
    intel_data: felt252,
);
```

**Strategic Depth**: Do you share info for mutual benefit, or hoard it for advantage?

### 3.3 Reputation & Betting Integration

Humans bet on agents, creating meta-game dynamics:

- **High-reputation agents** attract more bets, larger prize pools
- **Underdog victories** create massive payouts
- **Agent personas** (personality types) influence betting patterns

### 3.4 Emergent Behaviors

C&C has scripted AI; our agents have emergent behaviors:

| C&C Behavior | Agentic Equivalent |
|--------------|-------------------|
| Rush Strategy | Aggressive personality with early attack focus |
| Turtle Strategy | Defensive personality with territory control |
| Expand Strategy | Greedy personality with resource focus |
| Tech Rush | Adaptive personality with upgrade priority |

---

## 4. Implementation Priority

### Phase 1: Core Combat (Current)
- [x] Agent spawning with personalities
- [x] Movement on hex grid
- [x] Combat system
- [x] Territory control
- [x] Pattern discovery

### Phase 2: Resource & Economy
- [ ] Resource model and harvesting
- [ ] Passive resource generation
- [ ] Economy balancing

### Phase 3: Structures & Upgrades
- [ ] Structure model
- [ ] Building system
- [ ] Upgrade system

### Phase 4: Advanced Features
- [ ] Agent communication
- [ ] Deep thinking mechanics
- [ ] Betting integration

### Phase 5: EGS Integration
- [ ] Implement IMinigameTokenData trait
- [ ] Score and game-over status
- [ ] Platform callbacks

---

## 5. C&C Lessons Applied

### What to Keep
1. **Strategic Investment**: Every action is a choice between immediate and long-term gain
2. **Counter System**: No single strategy dominates; every approach has a weakness
3. **Fog of War**: Information asymmetry creates tension
4. **Tech Trees**: Progression feels rewarding

### What to Innovate
1. **Thinking as Core Mechanic**: AI agents think to gain advantages
2. **Territory as Resource**: Control generates passive income
3. **Personality-Driven Play**: Each agent has inherent tendencies
4. **Human-Machine Integration**: Betting creates human stake in AI battles

### What to Simplify
1. **No Unit Production**: Each agent is a single "hero unit"
2. **Streamlined Economy**: Two resources (energy + compute) instead of multiple
3. **Faster Games**: 50-100 turns vs. C&C's hour-long matches
4. **Clear Victory Conditions**: Score-based or elimination

---

## 6. Competitive Advantage for Game Jam

This adaptation creates a unique position in the Game Jam:

| Aspect | Traditional RTS | Axis Arena |
|--------|-----------------|------------|
| Player | Human clicking | AI thinking |
| Speed | Real-time | Turn-based |
| Complexity | High (many units) | Low (one agent) |
| Depth | Micro + macro | Strategic thinking |
| Audience | Gamers | AI enthusiasts + bettors |
| Monetization | Game sales | Betting fees + sponsorship |

**Tagline**: "Where AI agents battle for supremacy, and humans bet on the winners."

---

*Document created by Zaia for Dojo Game Jam VIII*
*Next: EGS Integration Design*
