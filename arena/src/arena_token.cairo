// ============================================================================
// AXIS ARENA - EGS Token Contract
// Embeddable Game Standard Implementation for $5K Track
// ============================================================================

/// IMinigameTokenData trait for EGS compliance
/// Required for platforms to query game state and scores
#[starknet::interface]
pub trait IMinigameTokenData<T> {
    /// Returns the final score for a game token
    fn get_score(self: @T, token_id: u256) -> u256;

    /// Returns whether the game has ended
    fn is_game_over(self: @T, token_id: u256) -> bool;

    /// Returns packed game-specific data
    /// Format: [winner_id:8][difficulty:8][kills:8][patterns:8][territories:16][reserved:16]
    fn get_game_data(self: @T, token_id: u256) -> u256;
}

#[dojo::contract]
pub mod arena_token {
    use dojo::model::ModelStorage;
    use axis_arena::models::Game;
    use super::IMinigameTokenData;

    // ========================================================================
    // EGS Implementation
    // ========================================================================

    #[abi(embed_v0)]
    impl MinigameTokenDataImpl of IMinigameTokenData<ContractState> {

        /// Get the final score for a game token
        /// Returns 0 if game not ended, calculated score otherwise
        fn get_score(self: @ContractState, token_id: u256) -> u256 {
            let world = self.world_default();
            let game_id = token_id.try_into().unwrap_or(0_u32);
            let game: Game = world.read_model(game_id);

            if game.status == 2_u8 {
                // Game ended - return calculated score
                game.final_score
            } else if game.status == 1_u8 {
                // Game active - return current progress score
                let kills_score = game.total_kills * 100_u32;
                let patterns_score = game.total_patterns * 50_u32;
                let territories_score = game.total_territories * 15_u32;
                (kills_score + patterns_score + territories_score).into()
            } else {
                // Game waiting - no score yet
                0_u256
            }
        }

        /// Check if game is over
        /// Returns true if game status == 2 (ended)
        fn is_game_over(self: @ContractState, token_id: u256) -> bool {
            let world = self.world_default();
            let game_id = token_id.try_into().unwrap_or(0_u32);
            let game: Game = world.read_model(game_id);

            game.status == 2_u8
        }

        /// Get packed game data for EGS platforms
        /// Returns a simplified packed value containing key game stats
        fn get_game_data(self: @ContractState, token_id: u256) -> u256 {
            let world = self.world_default();
            let game_id = token_id.try_into().unwrap_or(0_u32);
            let game: Game = world.read_model(game_id);

            // Simple packing using multiplication for bit shifts
            // winner_id * 1 + difficulty * 256 + kills * 65536 + patterns * 16777216 + territories * 4294967296
            let winner_val: u256 = game.winner_id.into();
            let difficulty_val: u256 = game.difficulty.into();
            let kills_val: u256 = game.total_kills.into();
            let patterns_val: u256 = game.total_patterns.into();
            let territories_val: u256 = game.total_territories.into();

            winner_val
                + difficulty_val * 256_u256
                + kills_val * 65536_u256
                + patterns_val * 16777216_u256
                + territories_val * 4294967296_u256
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
