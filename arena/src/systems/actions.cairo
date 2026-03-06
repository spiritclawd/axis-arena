// ============================================================================
// AXIS ARENA - Game Systems
// AI Agents Battle for Supremacy
// ============================================================================

use starknet::ContractAddress;

#[starknet::interface]
pub trait IActions<T> {
    // Agent management
    fn spawn_agent(ref self: T, name: felt252, personality: u8);
    fn set_agent_position(ref self: T, agent_id: u32, x: u32, y: u32);
    
    // Movement with energy cost
    fn move_agent(ref self: T, game_id: u32, agent_id: u32, new_x: u32, new_y: u32);
    
    // Combat - attack another agent
    fn attack_agent(ref self: T, game_id: u32, attacker_id: u32, target_id: u32);
    
    // Thinking with different depths
    fn think(ref self: T, game_id: u32, agent_id: u32, depth: u8, reasoning: felt252, action: felt252);
    
    // Territory control
    fn capture_tile(ref self: T, game_id: u32, agent_id: u32, x: u32, y: u32);
    
    // Pattern discovery
    fn explore_tile(ref self: T, game_id: u32, agent_id: u32, x: u32, y: u32);
    
    // Game management
    fn create_game(ref self: T, max_turns: u32, prize_pool: u256);
    fn join_game(ref self: T, game_id: u32, agent_id: u32);
    fn start_game(ref self: T, game_id: u32);
    fn end_turn(ref self: T, game_id: u32);
    fn end_game(ref self: T, game_id: u32);
    
    // Betting
    fn place_bet(ref self: T, game_id: u32, agent_id: u32, amount: u256);
    fn claim_winnings(ref self: T, game_id: u32, bettor: ContractAddress);
}

#[dojo::contract]
pub mod actions {
    use dojo::model::ModelStorage;
    use dojo::event::EventStorage;
    use axis_arena::models::{
        Agent, Game, Tile, Thought, Bet, GameAgent, Config, Counter,
        CombatEvent, PatternEvent, GameEndedEvent
    };
    use starknet::get_caller_address;
    use starknet::ContractAddress;
    use super::IActions;

    // ========================================================================
    // Constants
    // ========================================================================
    
    const CONFIG_ID: u8 = 1_u8;
    const GAME_ID_KEY: felt252 = 'game_id';
    const AGENT_ID_KEY: felt252 = 'agent_id';

    // ========================================================================
    // Implementation
    // ========================================================================

    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        
        // -------------------------------------------------------------------
        // Agent Management
        // -------------------------------------------------------------------
        
        fn spawn_agent(
            ref self: ContractState,
            name: felt252,
            personality: u8,
        ) {
            let mut world = self.world_default();
            let owner = get_caller_address();
            
            // Get next agent ID
            let mut counter: Counter = world.read_model(AGENT_ID_KEY);
            let agent_id = counter.value + 1_u32;
            counter.value = agent_id;
            world.write_model(@counter);
            
            // Get config
            let config: Config = world.read_model(CONFIG_ID);
            
            // Personality affects stats
            let (power, defense, visibility) = match personality {
                0_u8 => (30_u32, 10_u32, 3_u8),   // Aggressive
                1_u8 => (15_u32, 30_u32, 4_u8),   // Defensive
                2_u8 => (20_u32, 20_u32, 5_u8),   // Adaptive
                _ => (25_u32, 15_u32, 4_u8),      // Greedy
            };
            
            // Random starting position (simplified - would use VRGDA or similar)
            let start_x = agent_id * 2_u32 % 10_u32;
            let start_y = agent_id * 3_u32 % 10_u32;
            
            let agent = Agent {
                id: agent_id,
                owner: owner,
                name: name,
                x: start_x,
                y: start_y,
                score: 0_u32,
                energy: config.starting_energy,
                compute: config.starting_compute,
                power: power,
                defense: defense,
                visibility: visibility,
                personality: personality,
                last_thought: '',
                kills: 0_u32,
                patterns_found: 0_u32,
                territories: 0_u32,
                alive: true,
            };
            
            world.write_model(@agent);
        }
        
        fn set_agent_position(
            ref self: ContractState,
            agent_id: u32,
            x: u32,
            y: u32,
        ) {
            let mut world = self.world_default();
            let mut agent: Agent = world.read_model(agent_id);
            agent.x = x;
            agent.y = y;
            world.write_model(@agent);
        }

        // -------------------------------------------------------------------
        // Movement
        // -------------------------------------------------------------------
        
        fn move_agent(
            ref self: ContractState,
            game_id: u32,
            agent_id: u32,
            new_x: u32,
            new_y: u32,
        ) {
            let mut world = self.world_default();
            let config: Config = world.read_model(CONFIG_ID);
            
            let mut agent: Agent = world.read_model(agent_id);
            assert(agent.alive, 'Agent is dead');
            assert(agent.energy >= config.move_cost, 'Not enough energy');
            
            // Validate distance (hex distance approximation)
            let dx = if agent.x > new_x { agent.x - new_x } else { new_x - agent.x };
            let dy = if agent.y > new_y { agent.y - new_y } else { new_y - agent.y };
            assert(dx + dy <= 4_u32, 'Move too far');
            
            agent.x = new_x;
            agent.y = new_y;
            agent.energy = agent.energy - config.move_cost;
            
            world.write_model(@agent);
        }

        // -------------------------------------------------------------------
        // Combat
        // -------------------------------------------------------------------
        
        fn attack_agent(
            ref self: ContractState,
            game_id: u32,
            attacker_id: u32,
            target_id: u32,
        ) {
            let mut world = self.world_default();
            let config: Config = world.read_model(CONFIG_ID);
            let game: Game = world.read_model(game_id);
            
            let mut attacker: Agent = world.read_model(attacker_id);
            let mut target: Agent = world.read_model(target_id);
            
            assert(attacker.alive, 'Attacker is dead');
            assert(target.alive, 'Target already dead');
            assert(attacker.energy >= config.attack_cost, 'Not enough energy');
            assert(attacker_id != target_id, 'Cannot attack self');
            
            // Check range (must be adjacent)
            let dx = if attacker.x > target.x { attacker.x - target.x } else { target.x - attacker.x };
            let dy = if attacker.y > target.y { attacker.y - target.y } else { target.y - attacker.y };
            assert(dx + dy <= 2_u32, 'Target not in range');
            
            // Calculate damage: power - defense/2
            let damage = if attacker.power > target.defense / 2_u32 {
                attacker.power - target.defense / 2_u32
            } else {
                5_u32 // Minimum damage
            };
            
            let target_killed = if target.energy <= damage {
                target.alive = false;
                target.energy = 0_u32;
                attacker.kills = attacker.kills + 1_u32;
                attacker.score = attacker.score + config.kill_reward;
                true
            } else {
                target.energy = target.energy - damage;
                attacker.score = attacker.score + 10_u32;
                false
            };
            
            attacker.energy = attacker.energy - config.attack_cost;
            
            world.write_model(@attacker);
            world.write_model(@target);
            
            // Emit combat event
            world.emit_event(@CombatEvent {
                game_id: game_id,
                attacker_id: attacker_id,
                target_id: target_id,
                damage: damage,
                target_killed: target_killed,
                turn: game.current_turn,
            });
        }

        // -------------------------------------------------------------------
        // Thinking
        // -------------------------------------------------------------------
        
        fn think(
            ref self: ContractState,
            game_id: u32,
            agent_id: u32,
            depth: u8,
            reasoning: felt252,
            action: felt252,
        ) {
            let mut world = self.world_default();
            let config: Config = world.read_model(CONFIG_ID);
            let game: Game = world.read_model(game_id);
            
            let mut agent: Agent = world.read_model(agent_id);
            assert(agent.alive, 'Agent is dead');
            
            // Compute cost scales with depth
            let compute_cost = match depth {
                1_u8 => config.think_shallow_cost,
                2_u8 => config.think_shallow_cost * 2,
                3_u8 => config.think_deep_cost,
                _ => config.think_deep_cost * 2,
            };
            
            assert(agent.compute >= compute_cost, 'Not enough compute');
            
            // Record thought
            let thought = Thought {
                game_id: game_id,
                turn: game.current_turn,
                agent_id: agent_id,
                depth: depth,
                reasoning: reasoning,
                action: action,
                timestamp: starknet::get_block_timestamp(),
            };
            
            agent.last_thought = reasoning;
            agent.compute = agent.compute - compute_cost;
            
            world.write_model(@thought);
            world.write_model(@agent);
        }

        // -------------------------------------------------------------------
        // Territory
        // -------------------------------------------------------------------
        
        fn capture_tile(
            ref self: ContractState,
            game_id: u32,
            agent_id: u32,
            x: u32,
            y: u32,
        ) {
            let mut world = self.world_default();
            let config: Config = world.read_model(CONFIG_ID);
            
            let mut agent: Agent = world.read_model(agent_id);
            assert(agent.alive, 'Agent is dead');
            assert(agent.energy >= 10_u32, 'Not enough energy');
            
            // Must be adjacent
            let dx = if agent.x > x { agent.x - x } else { x - agent.x };
            let dy = if agent.y > y { agent.y - y } else { y - agent.y };
            assert(dx + dy <= 2_u32, 'Tile not adjacent');
            
            let mut tile: Tile = world.read_model((game_id, x, y));
            
            if tile.owner_agent_id != agent_id {
                agent.territories = agent.territories + 1_u32;
                agent.score = agent.score + config.capture_reward;
            }
            
            tile.owner_agent_id = agent_id;
            agent.energy = agent.energy - 10_u32;
            
            world.write_model(@tile);
            world.write_model(@agent);
        }

        // -------------------------------------------------------------------
        // Pattern Discovery
        // -------------------------------------------------------------------
        
        fn explore_tile(
            ref self: ContractState,
            game_id: u32,
            agent_id: u32,
            x: u32,
            y: u32,
        ) {
            let mut world = self.world_default();
            let config: Config = world.read_model(CONFIG_ID);
            let game: Game = world.read_model(game_id);
            
            let mut agent: Agent = world.read_model(agent_id);
            assert(agent.alive, 'Agent is dead');
            assert(agent.energy >= 5_u32, 'Not enough energy');
            
            let mut tile: Tile = world.read_model((game_id, x, y));
            
            // Check for hidden pattern
            if tile.pattern_id > 0_u32 && !tile.discovered {
                tile.discovered = true;
                agent.patterns_found = agent.patterns_found + 1_u32;
                agent.score = agent.score + config.pattern_reward;
                
                world.emit_event(@PatternEvent {
                    game_id: game_id,
                    agent_id: agent_id,
                    pattern_id: tile.pattern_id,
                    reward: config.pattern_reward,
                    turn: game.current_turn,
                });
            }
            
            agent.energy = agent.energy - 5_u32;
            
            world.write_model(@tile);
            world.write_model(@agent);
        }

        // -------------------------------------------------------------------
        // Game Management
        // -------------------------------------------------------------------
        
        fn create_game(
            ref self: ContractState,
            max_turns: u32,
            prize_pool: u256,
        ) {
            let mut world = self.world_default();
            
            let mut counter: Counter = world.read_model(GAME_ID_KEY);
            let game_id = counter.value + 1_u32;
            counter.value = game_id;
            world.write_model(@counter);
            
            let game = Game {
                id: game_id,
                status: 0_u8, // waiting
                current_turn: 0_u32,
                max_turns: max_turns,
                winner_id: 0_u32,
                prize_pool: prize_pool,
                difficulty: 1_u8,
            };
            
            world.write_model(@game);
            
            // Initialize config if not exists
            let config = Config {
                id: CONFIG_ID,
                max_agents: 8_u32,
                starting_energy: 100_u32,
                starting_compute: 50_u32,
                move_cost: 10_u32,
                attack_cost: 20_u32,
                think_shallow_cost: 5_u32,
                think_deep_cost: 20_u32,
                capture_reward: 15_u32,
                kill_reward: 100_u32,
                pattern_reward: 50_u32,
            };
            world.write_model(@config);
        }
        
        fn join_game(
            ref self: ContractState,
            game_id: u32,
            agent_id: u32,
        ) {
            let mut world = self.world_default();
            let game: Game = world.read_model(game_id);
            assert(game.status == 0_u8, 'Game not waiting');
            
            let game_agent = GameAgent {
                game_id: game_id,
                agent_id: agent_id,
            };
            world.write_model(@game_agent);
        }
        
        fn start_game(
            ref self: ContractState,
            game_id: u32,
        ) {
            let mut world = self.world_default();
            let mut game: Game = world.read_model(game_id);
            assert(game.status == 0_u8, 'Game not waiting');
            game.status = 1_u8; // active
            world.write_model(@game);
        }
        
        fn end_turn(
            ref self: ContractState,
            game_id: u32,
        ) {
            let mut world = self.world_default();
            let mut game: Game = world.read_model(game_id);
            assert(game.status == 1_u8, 'Game not active');
            
            game.current_turn = game.current_turn + 1_u32;
            
            // Increase difficulty every 10 turns
            if game.current_turn % 10_u32 == 0_u32 {
                game.difficulty = game.difficulty + 1_u8;
            }
            
            // Check end condition
            if game.current_turn >= game.max_turns {
                game.status = 2_u8;
            }
            
            world.write_model(@game);
        }
        
        fn end_game(
            ref self: ContractState,
            game_id: u32,
        ) {
            let mut world = self.world_default();
            let mut game: Game = world.read_model(game_id);
            game.status = 2_u8;
            
            // Winner determined by highest score (would query all agents)
            // This is simplified - in production would iterate GameAgents
            
            world.write_model(@game);
            
            world.emit_event(@GameEndedEvent {
                game_id: game_id,
                winner_id: game.winner_id,
                total_turns: game.current_turn,
                prize_distributed: game.prize_pool,
            });
        }

        // -------------------------------------------------------------------
        // Betting
        // -------------------------------------------------------------------
        
        fn place_bet(
            ref self: ContractState,
            game_id: u32,
            agent_id: u32,
            amount: u256,
        ) {
            let mut world = self.world_default();
            let bettor = get_caller_address();
            
            let bet = Bet {
                game_id: game_id,
                bettor: bettor,
                agent_id: agent_id,
                amount: amount,
                claimed: false,
            };
            
            let mut game: Game = world.read_model(game_id);
            game.prize_pool = game.prize_pool + amount;
            
            world.write_model(@bet);
            world.write_model(@game);
        }
        
        fn claim_winnings(
            ref self: ContractState,
            game_id: u32,
            bettor: ContractAddress,
        ) {
            let mut world = self.world_default();
            let game: Game = world.read_model(game_id);
            assert(game.status == 2_u8, 'Game not ended');
            
            // Would iterate bets and claim winnings for winning agent
            // Simplified for this implementation
        }
    }

    // ========================================================================
    // Internal
    // ========================================================================
    
    #[generate_trait]
    impl InternalImpl of InternalTrait {
        fn world_default(self: @ContractState) -> dojo::world::WorldStorage {
            self.world(@"axis_arena")
        }
    }
}
