// ============================================================================
// AXIS ARENA - Dojo Models
// AI Agents Battle for Supremacy
// ============================================================================

use starknet::ContractAddress;

/// Agent represents an AI player in the arena
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Agent {
    #[key]
    pub id: u32,
    pub owner: ContractAddress,
    pub name: felt252,
    pub x: u32,
    pub y: u32,
    pub score: u32,
    pub energy: u32,
    pub compute: u32,           // For deep thinking
    pub power: u32,             // Attack power
    pub defense: u32,           // Defense rating
    pub visibility: u8,         // Fog of war range
    pub personality: u8,        // 0=aggressive, 1=defensive, 2=adaptive, 3=greedy
    pub last_thought: felt252,
    pub kills: u32,
    pub patterns_found: u32,
    pub territories: u32,
    pub alive: bool,
}

/// Game represents the arena state (EGS-compliant)
/// Each game session is tokenized as an NFT for EGS platforms
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Game {
    #[key]
    pub id: u32,
    pub status: u8,             // 0=waiting, 1=active, 2=ended
    pub current_turn: u32,
    pub max_turns: u32,
    pub winner_id: u32,         // Current leader / final winner
    pub highest_score: u32,     // Track leader's score for comparison
    pub prize_pool: u256,
    pub difficulty: u8,         // Increases over time

    // EGS-specific fields for $5K track
    pub final_score: u256,      // Calculated at game end
    pub player_address: ContractAddress, // Token owner / game creator
    pub total_kills: u32,       // For score calculation
    pub total_patterns: u32,    // For score calculation
    pub total_territories: u32, // For score calculation
}

/// Tile represents a single hex with properties
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Tile {
    #[key]
    pub game_id: u32,
    pub x: u32,
    pub y: u32,
    pub owner_agent_id: u32,
    pub resource_value: u32,
    pub pattern_id: u32,        // Hidden pattern (0 = none)
    pub discovered: bool,
}

/// Thought records agent reasoning for transparency
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Thought {
    #[key]
    pub game_id: u32,
    pub turn: u32,
    pub agent_id: u32,
    pub depth: u8,              // Thinking depth (1-5)
    pub reasoning: felt252,
    pub action: felt252,
    pub timestamp: u64,
}

/// Bet represents a human bet on an agent
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Bet {
    #[key]
    pub game_id: u32,
    pub bettor: ContractAddress,
    pub agent_id: u32,
    pub amount: u256,
    pub claimed: bool,
}

/// GameAgent links games to participating agents
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct GameAgent {
    #[key]
    pub game_id: u32,
    pub agent_id: u32,
}

/// Config for game parameters
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Config {
    #[key]
    pub id: u8,
    pub max_agents: u32,
    pub starting_energy: u32,
    pub starting_compute: u32,
    pub move_cost: u32,
    pub attack_cost: u32,
    pub think_shallow_cost: u32,
    pub think_deep_cost: u32,
    pub capture_reward: u32,
    pub kill_reward: u32,
    pub pattern_reward: u32,
}

/// Counter for auto-incrementing IDs
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::model]
pub struct Counter {
    #[key]
    pub name: felt252,
    pub value: u32,
}

// ============================================================================
// Events
// ============================================================================

/// Event emitted when combat occurs
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::event]
pub struct CombatEvent {
    #[key]
    pub game_id: u32,
    pub attacker_id: u32,
    pub target_id: u32,
    pub damage: u32,
    pub target_killed: bool,
    pub turn: u32,
}

/// Event emitted when pattern discovered
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::event]
pub struct PatternEvent {
    #[key]
    pub game_id: u32,
    pub agent_id: u32,
    pub pattern_id: u32,
    pub reward: u32,
    pub turn: u32,
}

/// Event emitted when game ends
#[derive(Copy, Drop, Serde, Debug)]
#[dojo::event]
pub struct GameEndedEvent {
    #[key]
    pub game_id: u32,
    pub winner_id: u32,
    pub total_turns: u32,
    pub prize_distributed: u256,
}
