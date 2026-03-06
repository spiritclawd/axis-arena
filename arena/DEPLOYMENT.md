# Axis Arena Deployment

## Local Development (Katana)

### World Address
```
0x05ee8ff95a54a810d1873d7aebdb6b3cdc285daa95a81cfc42e8e45ae509635a
```

### Deployment Command
```bash
# Start Katana with no fees and no account validation
katana --dev --dev.no-fee --dev.no-account-validation

# In another terminal, migrate
sozo migrate --dev
```

### Katana Dev Accounts

| Account | Address | Private Key |
|---------|---------|-------------|
| 0 | 0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec | 0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912 |
| 1 | 0x13d9ee239f33fea4f8785b9e3870ade909e20a9599ae7cd62c1c292b73af1b7 | 0x1c9053c053edf324aec366a34c6901b1095b07af69495bffec7d7fe21effb1b |

### Predeployed Contracts

| Contract | Address |
|----------|---------|
| ETH Fee Token | 0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7 |
| STRK Fee Token | 0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d |
| Universal Deployer | 0x41a78e741e5af2fec34b695679bc6891742439f7afb8484ecd7766661ad02bf |

## Game Models Deployed

- Agent (m_Agent)
- Game (m_Game)
- Tile (m_Tile)
- Thought (m_Thought)
- Bet (m_Bet)
- GameAgent (m_GameAgent)
- Config (m_Config)
- Counter (m_Counter)

## Events Deployed

- CombatEvent (e_CombatEvent)
- PatternEvent (e_PatternEvent)
- GameEndedEvent (e_GameEndedEvent)

## Systems Deployed

- actions (axis_arena-actions)
