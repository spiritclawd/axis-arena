#!/bin/bash
# ============================================================================
# AXIS ARENA - Mainnet Deployment Script
# Deploy to Starknet Mainnet via Slot
# ============================================================================

set -e

echo "🎮 AXIS ARENA - Mainnet Deployment"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check dependencies
echo -e "\n${YELLOW}Step 1: Checking dependencies...${NC}"

# Check for sozo
if ! command -v sozo &> /dev/null; then
    echo -e "${RED}❌ sozo not found! Installing Dojo...${NC}"
    curl -L https://install.dojo-engine.org | bash
    source ~/.bashrc
else
    echo -e "${GREEN}✅ sozo found: $(sozo --version)${NC}"
fi

# Check for scarb
if ! command -v scarb &> /dev/null; then
    echo -e "${RED}❌ scarb not found! Installing Scarb...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
else
    echo -e "${GREEN}✅ scarb found: $(scarb --version)${NC}"
fi

# Check for slot
if ! command -v slot &> /dev/null; then
    echo -e "${RED}❌ slot not found! Installing Slot CLI...${NC}"
    curl -L https://slot.cartridge.gg | bash
else
    echo -e "${GREEN}✅ slot found${NC}"
fi

# Authenticate with Slot
echo -e "\n${YELLOW}Step 2: Authenticating with Slot...${NC}"
slot auth

# Create or use existing deployment
echo -e "\n${YELLOW}Step 3: Setting up Slot deployment...${NC}"
echo "Enter your deployment name (e.g., axis-arena-mainnet):"
read DEPLOYMENT_NAME

# Check if deployment exists
if slot deployments list 2>/dev/null | grep -q "$DEPLOYMENT_NAME"; then
    echo -e "${GREEN}✅ Using existing deployment: $DEPLOYMENT_NAME${NC}"
else
    echo "Creating new deployment: $DEPLOYMENT_NAME"
    slot deployments create "$DEPLOYMENT_NAME"
fi

# Build contracts
echo -e "\n${YELLOW}Step 4: Building contracts...${NC}"
cd arena
sozo build
echo -e "${GREEN}✅ Build complete${NC}"

# Run tests
echo -e "\n${YELLOW}Step 5: Running tests...${NC}"
sozo test
echo -e "${GREEN}✅ All tests passed${NC}"

# Deploy to mainnet
echo -e "\n${YELLOW}Step 6: Deploying to mainnet...${NC}"
echo -e "${RED}⚠️  This will deploy to STARKNET MAINNET!${NC}"
echo "Press Enter to continue or Ctrl+C to cancel..."
read

sozo migrate --network mainnet

# Get deployment info
echo -e "\n${YELLOW}Step 7: Getting deployment info...${NC}"

# Extract world address from manifest
WORLD_ADDRESS=$(grep -o '"world": "[^"]*"' target/dev/manifest.json | cut -d'"' -f4)
echo -e "${GREEN}✅ World Address: $WORLD_ADDRESS${NC}"

# Get Slot endpoints
SLOT_KATANA=$(slot deployments info "$DEPLOYMENT_NAME" 2>/dev/null | grep -i katana || echo "Check Slot dashboard")
SLOT_TORII=$(slot deployments info "$DEPLOYMENT_NAME" 2>/dev/null | grep -i torii || echo "Check Slot dashboard")

echo ""
echo "=================================="
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "=================================="
echo ""
echo "📋 Update your Vercel environment variables:"
echo ""
echo "  NEXT_PUBLIC_NETWORK=mainnet"
echo "  NEXT_PUBLIC_WORLD_ADDRESS=$WORLD_ADDRESS"
echo "  NEXT_PUBLIC_DOJO_RPC_URL=<from Slot dashboard>"
echo "  NEXT_PUBLIC_DOJO_TORII_URL=<from Slot dashboard>"
echo ""
echo "🌐 Slot Dashboard: https://slot.cartridge.gg"
echo "📜 Explorer: https://starkscan.co/contract/$WORLD_ADDRESS"
echo ""
echo "Good luck with Game Jam! 🏆"
