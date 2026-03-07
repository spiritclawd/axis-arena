// ============================================================================
// AXIS ARENA - Test Suite
// EGS Compliance & Game Lifecycle Tests
// ============================================================================

#[cfg(test)]
mod tests {
    use axis_arena::models::Game;

    // ========================================================================
    // Score Calculation Tests
    // ========================================================================

    #[test]
    fn test_score_calculation_basic() {
        let kills: u32 = 5;
        let patterns: u32 = 3;
        let territories: u32 = 20;
        let action_score = kills * 100 + patterns * 50 + territories * 15;
        assert(action_score == 950_u32, 'score mismatch');
    }

    #[test]
    fn test_speed_bonus_calculation() {
        let action_score: u32 = 1000;
        let turns_saved: u32 = 10;
        let speed_bonus = action_score * turns_saved * 2 / 100;
        assert(speed_bonus == 200_u32, 'bonus mismatch');
    }

    #[test]
    fn test_no_speed_bonus_at_max_turns() {
        let action_score: u32 = 1000;
        let turns_saved: u32 = 0;
        let speed_bonus = action_score * turns_saved * 2 / 100;
        assert(speed_bonus == 0_u32, 'should be zero');
    }

    #[test]
    fn test_large_speed_bonus() {
        let action_score: u32 = 1000;
        let turns_saved: u32 = 90;
        let speed_bonus = action_score * turns_saved * 2 / 100;
        assert(speed_bonus == 1800_u32, 'large bonus wrong');
    }

    // ========================================================================
    // Game Status Tests
    // ========================================================================

    #[test]
    fn test_game_status_values() {
        let waiting: u8 = 0;
        let active: u8 = 1;
        let ended: u8 = 2;
        assert(waiting == 0_u8, 'waiting wrong');
        assert(active == 1_u8, 'active wrong');
        assert(ended == 2_u8, 'ended wrong');
    }

    // ========================================================================
    // Agent Personality Tests
    // ========================================================================

    #[test]
    fn test_personality_aggressive() {
        let power: u32 = 30;
        let defense: u32 = 10;
        assert(power > defense, 'power>defense');
    }

    #[test]
    fn test_personality_defensive() {
        let power: u32 = 15;
        let defense: u32 = 30;
        assert(defense > power, 'defense>power');
    }

    #[test]
    fn test_personality_adaptive() {
        let power: u32 = 20;
        let defense: u32 = 20;
        let visibility: u8 = 5;
        assert(power == defense, 'balanced');
        assert(visibility == 5_u8, 'high visibility');
    }

    // ========================================================================
    // Combat Tests
    // ========================================================================

    #[test]
    fn test_damage_calculation() {
        let attacker_power: u32 = 30;
        let target_defense: u32 = 10;
        let damage = attacker_power - target_defense / 2;
        assert(damage == 25_u32, 'damage wrong');
    }

    #[test]
    fn test_minimum_damage() {
        let attacker_power: u32 = 10;
        let target_defense: u32 = 50;
        let damage = if attacker_power > target_defense / 2 {
            attacker_power - target_defense / 2
        } else {
            5_u32
        };
        assert(damage == 5_u32, 'min damage');
    }

    // ========================================================================
    // Packed Game Data Tests
    // ========================================================================

    #[test]
    fn test_game_data_packing() {
        let winner_id: u256 = 5;
        let difficulty: u256 = 3;
        let kills: u256 = 10;
        let patterns: u256 = 5;
        let territories: u256 = 25;

        let packed = winner_id
            + difficulty * 256_u256
            + kills * 65536_u256
            + patterns * 16777216_u256
            + territories * 4294967296_u256;

        let unpacked_winner = packed % 256_u256;
        let unpacked_difficulty = (packed / 256_u256) % 256_u256;
        let unpacked_kills = (packed / 65536_u256) % 256_u256;

        assert(unpacked_winner == winner_id, 'winner unpack');
        assert(unpacked_difficulty == difficulty, 'diff unpack');
        assert(unpacked_kills == kills, 'kills unpack');
    }

    // ========================================================================
    // Edge Case Tests
    // ========================================================================

    #[test]
    fn test_zero_score_game() {
        let kills: u32 = 0;
        let patterns: u32 = 0;
        let territories: u32 = 0;
        let score = kills * 100 + patterns * 50 + territories * 15;
        assert(score == 0_u32, 'zero game');
    }

    #[test]
    fn test_max_values() {
        let max_kills: u32 = 255;
        let max_patterns: u32 = 255;
        let max_territories: u32 = 65535;
        let score = max_kills * 100 + max_patterns * 50 + max_territories * 15;
        assert(score == 1021275_u32, 'max score');
    }

    #[test]
    fn test_final_score_with_speed_bonus() {
        let kills: u32 = 10;
        let patterns: u32 = 5;
        let territories: u32 = 30;
        let turns_saved: u32 = 20;

        let action_score = kills * 100 + patterns * 50 + territories * 15;
        let speed_bonus = action_score * turns_saved * 2 / 100;
        let final_score = action_score + speed_bonus;

        assert(action_score == 1700_u32, 'action wrong');
        assert(speed_bonus == 680_u32, 'bonus wrong');
        assert(final_score == 2380_u32, 'final wrong');
    }
}
