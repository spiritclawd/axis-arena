# EGS Integration Design for Axis Arena

> **Purpose**: Design Embeddable Game Standard compliance for Axis Arena
> **Author**: Zaia (spiritclawd)
> **Date**: March 2026
> **Prize Pool**: $5K dedicated for EGS track

---

## 1. EGS Overview

The Embeddable Game Standard (EGS) is an open protocol for building composable, provable on-chain games on Starknet. It defines:

1. **How games expose their logic** (traits and interfaces)
2. **How platforms mint and manage game tokens** (ERC721 + game data)
3. **How frontends display real-time game state** (indexer + WebSocket)

### Key Benefits for Axis Arena

| Benefit | Description |
|---------|-------------|
| **Platform Compatibility** | Auto-compatible with any EGS platform (tournaments, quests, etc.) |
| **Tokenization** | Each game becomes an NFT with score/game-over data |
| **Composability** | Can be embedded in metagames like Realms, Eternum |
| **Track Prize** | $5K dedicated prize pool for EGS games |

---

## 2. Core Requirements

### 2.1 Required Trait: IMinigameTokenData

The core requirement is implementing `IMinigameTokenData`:

```cairo
trait IMinigameTokenData<T> {
    /// Returns the current score for a token
    fn get_score(self: @T, token_id: u256) -> u256;

    /// Returns whether the game is over for a token
    fn is_game_over(self: @T, token_id: u256) -> bool;

    /// Returns packed game-specific data (optional)
    fn get_game_data(self: @T, token_id: u256) -> u256;
}
```

### 2.2 Axis Arena Adaptation

Our Game model already has:
- `status: u8` (0=waiting, 1=active, 2=ended) → maps to `is_game_over`
- We need to add a `score` field to track final score

**Implementation Plan**:
1. Each game session becomes a token (ERC721)
2. Token ID = game_id
3. Score = calculated from agent performance (kills, territories, patterns, etc.)
4. Game over = game.status == 2

---

## 3. Data Model Changes

### 3.1 Add EGS-Compatible Fields

```cairo
/// Game represents the arena state (EGS-compliant)
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Game {
    #[key]
    pub id: u32,
    pub status: u8,             // 0=waiting, 1=active, 2=ended
    pub current_turn: u32,
    pub max_turns: u32,
    pub winner_id: u32,
    pub prize_pool: u256,
    pub difficulty: u8,

    // EGS-specific fields
    pub final_score: u256,      // Calculated at game end
    pub player_address: ContractAddress, // Token owner
    pub game_data: u256,        // Packed custom data
}

/// Packed game data format (64 bits):
/// [0-7]   - winner_id (8 bits)
/// [8-15]  - difficulty (8 bits)
/// [16-23] - total_kills (8 bits)
/// [24-31] - total_patterns (8 bits)
/// [32-47] - total_territories (16 bits)
/// [48-63] - reserved
```

### 3.2 Score Calculation

```cairo
fn calculate_final_score(
    kills: u32,
    territories: u32,
    patterns: u32,
    turns: u32,
    max_turns: u32,
) -> u256 {
    // Base score from actions
    let action_score = kills * 100 + territories * 15 + patterns * 50;

    // Speed bonus (faster completion = higher score)
    let speed_multiplier = if max_turns > turns {
        100 + ((max_turns - turns) * 2)  // 2% bonus per turn saved
    } else {
        100
    };

    (action_score * speed_multiplier) / 100
}
```

---

## 4. Contract Architecture

### 4.1 Component Structure

```
axis_arena::contracts::ArenaToken
├── embeddable_game_standard::MinigameTokenComponent
├── embeddable_game_standard::TokenComponent (ERC721)
└── axis_arena::systems::Actions
```

### 4.2 Required Dependencies

Add to `Scarb.toml`:

```toml
[dependencies]
# EGS Core
game_components_embeddable_game_standard = { git = "https://github.com/Provable-Games/game-components", tag = "v1.1.0" }

# OpenZeppelin (required by EGS)
openzeppelin_token = { git = "https://github.com/OpenZeppelin/cairo-contracts.git", tag = "v3.0.0" }
openzeppelin_introspection = { git = "https://github.com/OpenZeppelin/cairo-contracts.git", tag = "v3.0.0" }
openzeppelin_access = { git = "https://github.com/OpenZeppelin/cairo-contracts.git", tag = "v3.0.0" }
```

### 4.3 Implementation

```cairo
#[dojo::contract]
pub mod arena_token {
    use game_components_embeddable_game_standard::minigame_token::MinigameTokenComponent;
    use game_components_embeddable_game_standard::token::TokenComponent;
    use game_components_interfaces::interfaces::IMinigameTokenData;

    component!(path: MinigameTokenComponent, storage: minigame_token, event: MinigameTokenEvent);
    component!(path: TokenComponent, storage: token, event: TokenEvent);

    // Implement EGS trait
    #[abi(embed_v0)]
    impl MinigameTokenDataImpl of IMinigameTokenData<ContractState> {
        fn get_score(self: @ContractState, token_id: u256) -> u256 {
            let game: Game = self.world_default().read_model(token_id);
            game.final_score
        }

        fn is_game_over(self: @ContractState, token_id: u256) -> bool {
            let game: Game = self.world_default().read_model(token_id);
            game.status == 2_u8
        }

        fn get_game_data(self: @ContractState, token_id: u256) -> u256 {
            let game: Game = self.world_default().read_model(token_id);
            game.game_data
        }
    }
}
```

---

## 5. Game Lifecycle with EGS

### 5.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     EGS Game Lifecycle                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. SETUP                                                       │
│     create_game() ──► Game created with status=0 (waiting)     │
│                    ──► Token minted (token_id = game_id)       │
│                                                                 │
│  2. PLAY                                                        │
│     join_game() ──► Agents join                                 │
│     start_game() ──► status=1 (active)                         │
│     [gameplay actions...] ──► move, attack, think, capture     │
│     end_turn() ──► Turn advances                                │
│                                                                 │
│  3. SYNC                                                        │
│     update_game() ──► Updates score during gameplay            │
│                     (optional, for live leaderboards)           │
│                                                                 │
│  4. COMPLETE                                                    │
│     end_game() ──► status=2 (ended)                            │
│                  ──► final_score calculated                     │
│                  ──► Platform receives callback                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Platform Callbacks

EGS platforms can receive callbacks:

```cairo
trait IMetagameCallback<T> {
    fn on_game_action(ref self: T, token_id: u256, action: felt252);
    fn on_game_over(ref self: T, token_id: u256, final_score: u256);
    fn on_objective_complete(ref self: T, token_id: u256, objective_id: u32);
}
```

---

## 6. Frontend Integration

### 6.1 denshokan-sdk

Use the official TypeScript SDK:

```typescript
import { DenshokanClient } from '@provable-games/denshokan-sdk';

const client = new DenshokanClient({
  rpcUrl: 'https://api.cartridge.gg/x/starknet/mainnet',
  registryAddress: '0x...'
});

// Subscribe to game updates
client.subscribeToGame(tokenId, (update) => {
  console.log('Score:', update.score);
  console.log('Game Over:', update.isGameOver);
});

// Get game data
const game = await client.getGame(tokenId);
```

### 6.2 WebSocket Subscriptions

```typescript
// Real-time score updates
client.ws.subscribe('game:score', { tokenId }, (data) => {
  updateLeaderboard(data.score);
});

// Game completion events
client.ws.subscribe('game:complete', { tokenId }, (data) => {
  showGameOverModal(data.finalScore, data.winner);
});
```

---

## 7. Metagame Integration

### 7.1 Leaderboard Component

EGS provides a leaderboard component:

```cairo
use game_components_metagame::leaderboard::LeaderboardComponent;

#[dojo::contract]
pub mod arena_leaderboard {
    component!(path: LeaderboardComponent, storage: leaderboard, event: LeaderboardEvent);

    impl ArenaLeaderboardImpl of Leaderboard<ContractState> {
        // Auto-tracks scores from game tokens
    }
}
```

### 7.2 Quest Integration

Games can define objectives:

```cairo
#[dojo::model]
pub struct Objective {
    #[key]
    pub id: u32,
    pub game_id: u32,
    pub objective_type: u8,  // 0=kill, 1=territory, 2=pattern, 3=survive
    pub target_value: u32,
    pub reward: u256,
}
```

---

## 8. Implementation Checklist

### Phase 1: Core EGS Compliance
- [ ] Add EGS dependencies to Scarb.toml
- [ ] Implement `IMinigameTokenData` trait
- [ ] Add `final_score` and `game_data` fields to Game model
- [ ] Implement score calculation in `end_game()`
- [ ] Test with Katana local chain

### Phase 2: Token Integration
- [ ] Integrate `TokenComponent` for ERC721
- [ ] Mint tokens on game creation
- [ ] Transfer tokens to winner on game end
- [ ] Test token ownership

### Phase 3: Platform Features
- [ ] Add `IMetagameCallback` support
- [ ] Implement objective/achievement system
- [ ] Add leaderboard tracking
- [ ] Test with denshokan-sdk

### Phase 4: Deployment
- [ ] Deploy to Sepolia testnet
- [ ] Register with EGS registry
- [ ] Submit to Game Jam with EGS track

---

## 9. Testing Strategy

### 9.1 Unit Tests

```cairo
#[test]
fn test_egs_score_calculation() {
    let score = calculate_final_score(5, 20, 3, 30, 50);
    assert(score > 0, 'Score should be positive');
}

#[test]
fn test_egs_game_over() {
    let mut game = Game { status: 2_u8, ... };
    assert(is_game_over(game.id), 'Should be game over');
}
```

### 9.2 Integration Tests

```typescript
describe('Axis Arena EGS', () => {
  it('should mint token on game creation', async () => {
    const { gameId, tokenId } = await createGame();
    expect(tokenId).toEqual(gameId);
  });

  it('should return correct score', async () => {
    await endGame(gameId);
    const score = await client.getScore(tokenId);
    expect(score).toBeGreaterThan(0);
  });
});
```

---

## 10. Resources

- **EGS Documentation**: https://docs.provable.games/embeddable-game-standard
- **game-components**: https://github.com/Provable-Games/game-components
- **denshokan-sdk**: https://github.com/Provable-Games/denshokan-sdk
- **Context7 (AI Coding)**: `/provable-games/game-components`

---

*Document created by Zaia for Dojo Game Jam VIII*
*Both Main Track ($15K) + EGS Track ($5K)*
