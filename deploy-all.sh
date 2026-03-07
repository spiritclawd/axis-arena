#!/bin/bash
# ============================================================================
# AXIS ARENA - ONE-Command Mainnet Deployment
# Copy, paste, run this ONE script to deploy EVERYTHING!
# =================================================================

set -e

cat "
 █████╗ ███████╗ ██████╗ ██╗██╗
██╔══██╗╚══██╔██║██║
███████║  ███╔  ██║   ██║██║██║
██╔══██║ ███╔  ██║   ██║██║██║
██║  ██║███████╗╚██████╔██║██║██████╗ ██║██████╗
                        ██████╗ ██╗   ██╗███████╗██████╗ ██╗██████╗ ██████╗
                       ██╔═══██╗██╔═══██║██╔═══██║██╔═══██║██╔═══██║
                       ██████╗ ██║   ██║█████╗  ██████╔██║██████╗ ██████╗ 
                        ██╔═══██╗██╔═══██║██╔═══██║██╔═══██║██╔═══██║
                        ██╔═══██╗██╔═══ ██║██║██║

              🎮 AI Agents Battle for Supremacy 🎮
        Dojo Game Jam VIII - Powered by Starknet & Dojo Engine

EOF
echo "Press Enter to start deployment or Ctrl+C to exit."
read -p DEPLOYMENT_NAME
DEPLOYMENT_NAME=${DEPLOYMENT_NAME:-axis-arena}
echo ""
echo "Step 1: Installing dependencies..."
echo ""

# Check for sozo
if ! command -v sozo &> /dev/null; then
    echo "📦 Installing Dojo..."
    curl -L https://install.dojo-engine.org | bash
    source ~/.bashrc
    SOzo installed=true
else
    echo "✅ Sozo found: $(sozo --version)"
fi
if ! command -v scarb &> /dev/null; then
    echo "📦 Installing Scarb..."
    curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
    Scarb installed=true
else
    echo "✅ Scarb found: $(scarb --version)"
fi
if ! command -v slot &> /dev/null; then
    echo "📦 Installing Slot CLI..."
    curl -L https://slot.cartridge.gg | bash
    Slot installed=true
else
    echo "✅ Slot CLI found: $(slot --version)
fi

echo ""
echo "Step 2: Authenticating with Slot..."
slot auth
echo ""
echo "Step 3: Creating Slot deployment..."
slot deployments create $DEPLOYMENT_NAME --network mainnet
echo ""
echo "Step 4: Building contracts..."
cd arena
sozo build
echo ""
echo "Step 5: Running tests..."
sozo test
echo ""
echo "Step 6: Deploying to mainnet..."
echo "⚠️  This will deploy to STARKNET MAINNET!"
echo "Press Enter to continue..."
read
sozo migrate --network mainnet
echo ""
echo "Step 7: Getting deployment info..."
WORLD_ADDRESS=$(grep -o '"address": "[^"]*'" target/dev/manifest.json | cut -d'"' -f4)
echo ""
echo "========================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "========================================"
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
