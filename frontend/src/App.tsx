'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import {
  Swords, Trophy, Zap, Target, Brain, Skull, Coins, Play, SkipForward, Plus,
  Users, Timer, Volume2, VolumeX, Gauge, Sparkles, Crown, Flame, Shield,
  Dice5, Gem, Bot, Wallet, LogOut, Eye, Crosshair, X, AlertCircle, CheckCircle,
  TrendingUp, Radio, Hexagon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useWallet, formatAddress } from '@/hooks/useWallet'

// ============================================
// TYPES
// ============================================
interface Agent {
  id: number; name: string; x: number; y: number; score: number; energy: number;
  personality: 'aggressive' | 'defensive' | 'adaptive' | 'greedy';
  lastThought: string; alive: boolean; color: string; odds: number; totalBets: number;
  compute: number; power: number; defense: number; visibility: number;
  kills: number; patterns_found: number; territories: number;
  // New: Previous position for trail effect
  prevX?: number; prevY?: number;
}

interface Game { id: number; status: 'waiting' | 'active' | 'ended'; currentTurn: number; maxTurns: number; prizePool: string; }

// NEW: Combat Log Entry type
interface CombatLogEntry {
  id: number; turn: number; type: 'attack' | 'kill' | 'pattern' | 'territory' | 'powerup' | 'death';
  message: string; timestamp: number; agentId?: number; targetId?: number; value?: number;
}

interface Thought { agentId: number; turn: number; reasoning: string; action: string; timestamp: number; }
interface Bet { agentId: number; amount: number; }

// NEW: Damage Number type for floating damage
interface DamageNumber {
  id: number; x: number; y: number; value: number; type: 'damage' | 'heal' | 'crit';
}

// NEW: Explosion Particle type
interface Particle {
  id: number; x: number; y: number; vx: number; vy: number; life: number; color: string; size: number;
}

// NEW: Trail point for movement trails
interface TrailPoint {
  id: number; x: number; y: number; color: string; opacity: number;
}

// ============================================
// CONSTANTS
// ============================================
const GRID_WIDTH = 10
const GRID_HEIGHT = 10

const PERSONALITY_CONFIG = {
  aggressive: { icon: Flame, label: 'Aggressive', color: '#ef4444', thoughts: ['Enemy spotted. Engaging!', 'Attack is the best defense!', 'I smell weakness. Time to strike!'] },
  defensive: { icon: Shield, label: 'Defensive', color: '#3b82f6', thoughts: ['Better to fortify my position.', 'Patience wins wars.', 'Let them come to me.'] },
  adaptive: { icon: Eye, label: 'Adaptive', color: '#a855f7', thoughts: ['Analyzing the battlefield...', 'I see all, I adapt quickly.', 'Every situation has an optimal response.'] },
  greedy: { icon: Gem, label: 'Greedy', color: '#eab308', thoughts: ['High value target nearby!', 'More resources! Always more!', 'Wealth is power.'] }
}

const AGENT_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#8b5cf6']
const AGENT_NAMES = ['NEXUS-7', 'CIPHER', 'VORTEX', 'PHANTOM', 'SENTINEL', 'ORACLE']

// ============================================
// PIXEL ART SPRITES
// ============================================
function PixelSprite({ personality, color, isDead }: { personality: string; color: string; isDead?: boolean }) {
  const opacity = isDead ? 0.3 : 1
  const filter = isDead ? 'grayscale(100%)' : 'none'
  
  const sprites: Record<string, JSX.Element> = {
    aggressive: (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated', opacity, filter }}>
        <rect x="6" y="1" width="4" height="2" fill={color} />
        <rect x="4" y="3" width="8" height="4" fill={color} />
        <rect x="3" y="7" width="10" height="4" fill={color} />
        <rect x="4" y="11" width="3" height="3" fill={color} />
        <rect x="9" y="11" width="3" height="3" fill={color} />
        <rect x="12" y="5" width="3" height="2" fill="#ffaaaa" />
        <rect x="5" y="4" width="2" height="2" fill="#fff" />
        <rect x="9" y="4" width="2" height="2" fill="#fff" />
        {/* Death X mark */}
        {isDead && (
          <>
            <line x1="2" y1="2" x2="14" y2="14" stroke="#ff0000" strokeWidth="2" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="#ff0000" strokeWidth="2" />
          </>
        )}
      </svg>
    ),
    defensive: (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated', opacity, filter }}>
        <rect x="5" y="2" width="6" height="2" fill={color} />
        <rect x="4" y="4" width="8" height="6" fill={color} />
        <rect x="2" y="6" width="12" height="4" fill={color} />
        <rect x="5" y="10" width="2" height="4" fill={color} />
        <rect x="9" y="10" width="2" height="4" fill={color} />
        <rect x="6" y="5" width="4" height="3" fill="#fff" />
        {isDead && (
          <>
            <line x1="2" y1="2" x2="14" y2="14" stroke="#ff0000" strokeWidth="2" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="#ff0000" strokeWidth="2" />
          </>
        )}
      </svg>
    ),
    adaptive: (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated', opacity, filter }}>
        <rect x="6" y="1" width="4" height="1" fill={color} />
        <rect x="5" y="2" width="6" height="2" fill={color} />
        <rect x="4" y="4" width="8" height="4" fill={color} />
        <rect x="3" y="8" width="10" height="2" fill={color} />
        <rect x="5" y="10" width="6" height="2" fill={color} />
        <rect x="6" y="12" width="4" height="2" fill={color} />
        <rect x="7" y="5" width="2" height="2" fill="#fff" />
        <rect x="6" y="6" width="4" height="1" fill="#000" />
        {isDead && (
          <>
            <line x1="2" y1="2" x2="14" y2="14" stroke="#ff0000" strokeWidth="2" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="#ff0000" strokeWidth="2" />
          </>
        )}
      </svg>
    ),
    greedy: (
      <svg viewBox="0 0 16 16" width="32" height="32" style={{ imageRendering: 'pixelated', opacity, filter }}>
        <rect x="4" y="2" width="8" height="8" fill={color} />
        <rect x="5" y="3" width="6" height="6" fill="#ffd700" />
        <rect x="7" y="4" width="2" height="4" fill={color} />
        <rect x="5" y="6" width="6" height="1" fill={color} />
        <rect x="5" y="10" width="2" height="3" fill={color} />
        <rect x="9" y="10" width="2" height="3" fill={color} />
        {isDead && (
          <>
            <line x1="2" y1="2" x2="14" y2="14" stroke="#ff0000" strokeWidth="2" />
            <line x1="14" y1="2" x2="2" y2="14" stroke="#ff0000" strokeWidth="2" />
          </>
        )}
      </svg>
    )
  }
  return sprites[personality] || sprites.aggressive
}

// ============================================
// GENERATE MOCK AGENT
// ============================================
function generateMockAgent(id: number): Agent {
  const personalities: Agent['personality'][] = ['aggressive', 'defensive', 'adaptive', 'greedy']
  const personality = personalities[Math.floor(Math.random() * personalities.length)]
  const stats = { aggressive: { power: 30, defense: 10, visibility: 3 }, defensive: { power: 15, defense: 30, visibility: 4 }, adaptive: { power: 20, defense: 20, visibility: 5 }, greedy: { power: 25, defense: 15, visibility: 4 } }
  const s = stats[personality]
  return {
    id, name: AGENT_NAMES[id - 1] || `AGENT-${id}`, x: Math.floor(Math.random() * GRID_WIDTH), y: Math.floor(Math.random() * GRID_HEIGHT),
    score: Math.floor(Math.random() * 100), energy: 50 + Math.floor(Math.random() * 50), personality,
    lastThought: 'Awaiting orders...', alive: true, color: AGENT_COLORS[(id - 1) % AGENT_COLORS.length],
    odds: 1.5 + Math.random() * 3, totalBets: Math.floor(Math.random() * 100),
    compute: 50, power: s.power, defense: s.defense, visibility: s.visibility, kills: 0, patterns_found: 0, territories: 0
  }
}

// ============================================
// HEX POSITION HELPER
// ============================================
function getHexPosition(x: number, y: number) {
  const hexWidth = 52, hexHeight = 60
  const offsetX = (y % 2) * (hexWidth / 2)
  return {
    posX: x * hexWidth + offsetX + 30,
    posY: y * (hexHeight * 0.75) + 30
  }
}

// ============================================
// NEW: FLOATING DAMAGE NUMBER COMPONENT
// ============================================
function FloatingDamage({ damage }: { damage: DamageNumber }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.5 }}
      animate={{ opacity: 0, y: -60, scale: 1.2 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      className="absolute pointer-events-none z-50"
      style={{ left: damage.x, top: damage.y }}
    >
      <span className={cn(
        "font-bold text-2xl drop-shadow-lg",
        damage.type === 'damage' && "text-red-500",
        damage.type === 'crit' && "text-yellow-400 text-3xl",
        damage.type === 'heal' && "text-green-400"
      )}>
        {damage.type === 'heal' ? '+' : '-'}{damage.value}
      </span>
    </motion.div>
  )
}

// ============================================
// NEW: EXPLOSION EFFECT COMPONENT
// ============================================
function ExplosionEffect({ x, y, color, onComplete }: { x: number; y: number; color: string; onComplete: () => void }) {
  return (
    <motion.g
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      transform={`translate(${x}, ${y})`}
    >
      {/* Outer ring */}
      <motion.circle
        r="20"
        fill="none"
        stroke={color}
        strokeWidth="3"
        initial={{ r: 5, opacity: 1 }}
        animate={{ r: 30, opacity: 0 }}
        transition={{ duration: 0.4 }}
      />
      {/* Inner flash */}
      <motion.circle
        r="10"
        fill={color}
        initial={{ r: 0, opacity: 1 }}
        animate={{ r: 15, opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      {/* Spark particles */}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45) * Math.PI / 180
        return (
          <motion.circle
            key={i}
            r="3"
            fill={color}
            initial={{ cx: 0, cy: 0, opacity: 1 }}
            animate={{
              cx: Math.cos(angle) * 40,
              cy: Math.sin(angle) * 40,
              opacity: 0
            }}
            transition={{ duration: 0.4 }}
          />
        )
      })}
    </motion.g>
  )
}

// ============================================
// NEW: PARTICLE SYSTEM COMPONENT
// ============================================
function ParticleSystem({ particles }: { particles: Particle[] }) {
  return (
    <g>
      {particles.map(p => (
        <motion.circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.size}
          fill={p.color}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: p.life / 1000 }}
        />
      ))}
    </g>
  )
}

// ============================================
// NEW: TRAIL EFFECT COMPONENT
// ============================================
function TrailEffect({ trails }: { trails: TrailPoint[] }) {
  return (
    <g>
      {trails.map(trail => (
        <motion.circle
          key={trail.id}
          cx={trail.x}
          cy={trail.y}
          r="4"
          fill={trail.color}
          initial={{ opacity: trail.opacity }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </g>
  )
}

// ============================================
// NEW: POWER-UP PARTICLE EFFECT
// ============================================
function PowerUpEffect({ x, y, onComplete }: { x: number; y: number; onComplete: () => void }) {
  return (
    <motion.g
      transform={`translate(${x}, ${y})`}
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 1 }}
      onAnimationComplete={onComplete}
    >
      {[...Array(6)].map((_, i) => {
        const angle = (i * 60) * Math.PI / 180
        return (
          <motion.circle
            key={i}
            r="2"
            fill="#ffd700"
            initial={{ cx: 0, cy: 0, opacity: 1 }}
            animate={{
              cx: Math.cos(angle) * 25,
              cy: Math.sin(angle) * 25,
              opacity: 0
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )
      })}
      <motion.text
        textAnchor="middle"
        fill="#ffd700"
        fontSize="12"
        fontWeight="bold"
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        +POWER
      </motion.text>
    </motion.g>
  )
}

// ============================================
// HEX CELL COMPONENT
// ============================================
function HexCell({ 
  x, y, agent, isSelected, onClick, isVisible, 
  // NEW: Additional props for effects
  isExplored, trails, showFog 
}: { 
  x: number; y: number; 
  agent?: Agent; 
  isSelected: boolean; 
  onClick: () => void;
  isVisible?: boolean;
  isExplored?: boolean;
  trails: TrailPoint[];
  showFog: boolean;
}) {
  const hexWidth = 52, hexHeight = 60
  const { posX, posY } = getHexPosition(x, y)
  
  // NEW: Fog of war visualization
  const fogOpacity = showFog && !isExplored ? 0.3 : 1
  const fogFill = showFog && !isExplored ? 'rgba(0,0,0,0.6)' : 'transparent'
  const fogStroke = showFog && !isVisible ? 'rgba(255,255,255,0.05)' : undefined

  return (
    <g transform={`translate(${posX}, ${posY})`} onClick={onClick} className="cursor-pointer">
      {/* Base hex */}
      <polygon points="0,-26 22.5,-13 22.5,13 0,26 -22.5,13 -22.5,-13"
        fill={agent ? `${agent.color}20` : 'rgba(255,255,255,0.03)'}
        stroke={isSelected ? '#00ffff' : agent ? agent.color : fogStroke || 'rgba(255,255,255,0.1)'}
        strokeWidth={isSelected ? 3 : 1}
        className="transition-all duration-300"
        style={{ opacity: fogOpacity }}
      />
      
      {/* NEW: Fog of war overlay */}
      {showFog && !isExplored && (
        <polygon points="0,-26 22.5,-13 22.5,13 0,26 -22.5,13 -22.5,-13"
          fill={fogFill}
          className="pointer-events-none"
        />
      )}
      
      {/* NEW: Glow effect for selected agent */}
      {isSelected && agent && (
        <motion.polygon
          points="0,-26 22.5,-13 22.5,13 0,26 -22.5,13 -22.5,-13"
          fill="none"
          stroke="#00ffff"
          strokeWidth="2"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      
      {/* Agent sprite */}
      {agent && (
        <motion.g 
          initial={{ scale: 0 }} 
          animate={{ scale: agent.alive ? 1 : 0.8, opacity: agent.alive ? 1 : 0.5 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 12 }}
        >
          <PixelSprite personality={agent.personality} color={agent.color} isDead={!agent.alive} />
        </motion.g>
      )}
    </g>
  )
}

// ============================================
// THOUGHT BUBBLE
// ============================================
function ThoughtBubble({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const config = PERSONALITY_CONFIG[agent.personality]
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-50">
      <div className="bg-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 min-w-[200px] max-w-[280px]">
        <div className="flex items-center gap-2 mb-2">
          <config.icon className="w-4 h-4" style={{ color: config.color }} />
          <span className="text-xs font-bold text-cyan-400">{agent.name}</span>
          <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
        </div>
        <p className="text-sm text-gray-200">"{agent.lastThought}"</p>
      </div>
    </motion.div>
  )
}

// ============================================
// AGENT STATS PANEL
// ============================================
function AgentStats({ agent, onClose, onPlaceBet }: { agent: Agent; onClose: () => void; onPlaceBet: () => void }) {
  const config = PERSONALITY_CONFIG[agent.personality]
  
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${agent.color}30` }}>
            <PixelSprite personality={agent.personality} color={agent.color} isDead={!agent.alive} />
          </div>
          <div>
            <h3 className={cn("font-bold", agent.alive ? "text-white" : "text-gray-500 line-through")}>{agent.name}</h3>
            <Badge variant="outline" style={{ borderColor: config.color, color: config.color }}>{config.label}</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
      </div>
      <div className="space-y-2">
        <div><div className="flex justify-between text-sm"><span className="text-gray-400">Energy</span><span>{agent.energy}%</span></div><Progress value={agent.energy} className="h-2" /></div>
        <div><div className="flex justify-between text-sm"><span className="text-gray-400">Compute</span><span>{agent.compute}%</span></div><Progress value={agent.compute} className="h-2 bg-purple-900" /></div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-black/40 rounded p-2"><div className="text-xs text-gray-400">Power</div><div className="text-lg font-bold text-red-400">{agent.power}</div></div>
          <div className="bg-black/40 rounded p-2"><div className="text-xs text-gray-400">Defense</div><div className="text-lg font-bold text-blue-400">{agent.defense}</div></div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-black/40 rounded p-2"><div className="text-gray-400">Kills</div><div className="font-bold">{agent.kills}</div></div>
          <div className="bg-black/40 rounded p-2"><div className="text-gray-400">Patterns</div><div className="font-bold">{agent.patterns_found}</div></div>
          <div className="bg-black/40 rounded p-2"><div className="text-gray-400">Territory</div><div className="font-bold">{agent.territories}</div></div>
        </div>
        <div className="bg-black/40 rounded p-2"><div className="text-xs text-gray-400 mb-1">Last Thought</div><p className="text-sm text-cyan-300 italic">"{agent.lastThought}"</p></div>
        {/* NEW: Betting button with odds display */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded p-2 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400">Betting Odds</div>
            <div className="text-lg font-bold text-yellow-400">{agent.odds.toFixed(2)}x</div>
          </div>
          <Button 
            onClick={onPlaceBet} 
            disabled={!agent.alive}
            className="bg-gradient-to-r from-cyan-600 to-purple-600"
          >
            <Coins className="w-4 h-4 mr-2" />Place Bet
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// NEW: COMBAT LOG PANEL
// ============================================
function CombatLogPanel({ logs, agents }: { logs: CombatLogEntry[]; agents: Agent[] }) {
  const getLogIcon = (type: CombatLogEntry['type']) => {
    switch (type) {
      case 'attack': return <Swords className="w-4 h-4 text-red-400" />
      case 'kill': return <Skull className="w-4 h-4 text-red-500" />
      case 'death': return <Skull className="w-4 h-4 text-gray-500" />
      case 'pattern': return <Brain className="w-4 h-4 text-purple-400" />
      case 'territory': return <Hexagon className="w-4 h-4 text-green-400" />
      case 'powerup': return <Sparkles className="w-4 h-4 text-yellow-400" />
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }
  
  const getLogColor = (type: CombatLogEntry['type']) => {
    switch (type) {
      case 'attack': return 'border-red-500/30 bg-red-500/10'
      case 'kill': return 'border-red-500/50 bg-red-500/20'
      case 'death': return 'border-gray-500/30 bg-gray-500/10'
      case 'pattern': return 'border-purple-500/30 bg-purple-500/10'
      case 'territory': return 'border-green-500/30 bg-green-500/10'
      case 'powerup': return 'border-yellow-500/30 bg-yellow-500/10'
      default: return 'border-white/10 bg-black/40'
    }
  }

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-white">
          <Radio className="w-5 h-5 text-red-400" />
          Combat Log
        </CardTitle>
        <CardDescription>Real-time battle events</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-40">
          <div className="space-y-1">
            <AnimatePresence initial={false}>
              {logs.slice(-15).reverse().map((log, i) => {
                const agent = agents.find(a => a.id === log.agentId)
                const target = agents.find(a => a.id === log.targetId)
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex items-start gap-2 p-2 rounded border", getLogColor(log.type))}
                  >
                    {getLogIcon(log.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-200 truncate">{log.message}</p>
                      <p className="text-[10px] text-gray-500">Turn {log.turn}</p>
                    </div>
                    {agent && (
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: agent.color }}
                      >
                        <span className="text-[8px] text-white font-bold">{agent.name[0]}</span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ============================================
// BETTING PANEL
// ============================================
function BettingPanel({ agents, prizePool, onPlaceBet }: { agents: Agent[]; prizePool: string; onPlaceBet: (agentId: number) => void }) {
  const sorted = [...agents].sort((a, b) => a.odds - b.odds)
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-white"><Coins className="w-5 h-5 text-yellow-400" />Betting Arena</CardTitle>
        <CardDescription>Prize Pool: <span className="text-yellow-400 font-bold">{prizePool} ETH</span></CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-2">
            {sorted.map((agent, i) => {
              const config = PERSONALITY_CONFIG[agent.personality]
              return (
                <motion.div 
                  key={agent.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition-colors",
                    !agent.alive && "opacity-40"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", !agent.alive && "grayscale")} style={{ backgroundColor: agent.color }}>
                    <PixelSprite personality={agent.personality} color={agent.color} isDead={!agent.alive} />
                  </div>
                  <div className="flex-1">
                    <div className={cn("text-sm font-medium", agent.alive ? "text-white" : "text-gray-500 line-through")}>{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.odds.toFixed(1)}x • {agent.totalBets} ETH</div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => onPlaceBet(agent.id)}
                    disabled={!agent.alive}
                  >
                    <Coins className="w-4 h-4" />
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ============================================
// NEW: x402 BETTING MODAL
// ============================================
function BettingModalInner({ 
  isOpen, 
  onClose, 
  agent, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  agent: Agent;
  onConfirm: (amount: string) => void;
}) {
  const [betAmount, setBetAmount] = useState('0.1')
  const [step, setStep] = useState<'amount' | 'connect' | 'confirm' | 'processing' | 'success'>('amount')
  const wallet = useWallet()

  // Handle continue button
  const handleContinue = () => {
    if (!wallet.isConnected) {
      setStep('connect')
    } else {
      setStep('confirm')
    }
  }

  // Handle confirm button
  const handleConfirm = () => {
    setStep('processing')
    // Simulate x402 payment flow
    setTimeout(() => {
      setStep('success')
      setTimeout(() => {
        onConfirm(betAmount)
        onClose()
      }, 1500)
    }, 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="bg-gray-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-400" />
            Place Bet on {agent.name}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Odds: <span className="text-yellow-400 font-bold">{agent.odds.toFixed(2)}x</span>
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Bet Amount (ETH)</label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="bg-black/40 border-white/20"
                  placeholder="0.1"
                  step="0.01"
                  min="0.01"
                />
              </div>
              <div className="flex gap-2">
                {['0.1', '0.5', '1.0'].map(amount => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(amount)}
                    className="flex-1 border-white/20"
                  >
                    {amount} ETH
                  </Button>
                ))}
              </div>
              <div className="bg-black/40 rounded p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Potential Win</span>
                  <span className="text-green-400 font-bold">
                    {(parseFloat(betAmount || '0') * agent.odds).toFixed(3)} ETH
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform Fee</span>
                  <span className="text-gray-500">2%</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'connect' && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="text-center py-4">
                <Wallet className="w-12 h-12 mx-auto text-purple-400 mb-3" />
                <p className="text-gray-400">Connect your wallet to place a bet</p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={() => { wallet.connect('cartridge'); setStep('confirm'); }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <Wallet className="w-4 h-4 mr-2" />Connect with Cartridge
                </Button>
                <Button
                  onClick={() => { wallet.connect('argent'); setStep('confirm'); }}
                  variant="outline"
                  className="w-full border-white/20"
                >
                  <Wallet className="w-4 h-4 mr-2" />Connect with Argent
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="bg-black/40 rounded p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Agent</span>
                  <span className="font-bold">{agent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Bet Amount</span>
                  <span className="text-yellow-400 font-bold">{betAmount} ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Odds</span>
                  <span>{agent.odds.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Potential Win</span>
                  <span className="text-green-400">{(parseFloat(betAmount || '0') * agent.odds).toFixed(3)} ETH</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                Payment will be processed via x402 protocol on Starknet
              </p>
            </motion.div>
          )}

          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 mx-auto mb-4"
              >
                <Coins className="w-12 h-12 text-yellow-400" />
              </motion.div>
              <p className="text-gray-400">Processing x402 Payment...</p>
              <p className="text-xs text-gray-500 mt-2">Confirming transaction on Starknet</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
              </motion.div>
              <p className="text-xl font-bold text-green-400">Bet Placed!</p>
              <p className="text-gray-400 mt-2">Your bet of {betAmount} ETH on {agent.name} is confirmed</p>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          {step === 'amount' && (
            <Button onClick={handleContinue} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600">
              Continue
            </Button>
          )}
          {step === 'confirm' && (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={handleConfirm} className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600">
                Confirm Bet
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Wrapper component that uses key to reset modal state
function BettingModal({ 
  isOpen, 
  onClose, 
  agent, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  agent: Agent | null;
  onConfirm: (amount: string) => void;
}) {
  if (!agent) return null
  
  // Using key prop on the inner component forces remount when agent changes
  // This naturally resets all state
  return (
    <BettingModalInner
      key={agent.id}
      isOpen={isOpen}
      onClose={onClose}
      agent={agent}
      onConfirm={onConfirm}
    />
  )
}

// ============================================
// LEADERBOARD
// ============================================
function Leaderboard({ agents, currentTurn, maxTurns, status }: { agents: Agent[]; currentTurn: number; maxTurns: number; status: string }) {
  const sorted = [...agents].sort((a, b) => b.score - a.score)
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-white"><Trophy className="w-5 h-5 text-yellow-400" />Leaderboard</CardTitle>
        <CardDescription className="flex justify-between">
          <span className={status === 'active' ? 'text-green-400' : 'text-yellow-400'}>{status.toUpperCase()}</span>
          <span>Turn <span className="text-cyan-400 font-bold">{currentTurn}</span>/{maxTurns}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sorted.map((agent, i) => (
            <motion.div 
              key={agent.id} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg transition-all",
                i === 0 && agent.alive && "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30",
                !agent.alive && "opacity-40 bg-gray-900/50"
              )}
            >
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs", i === 0 ? "bg-yellow-500 text-black" : "bg-gray-700")}>
                {i === 0 ? <Crown className="w-3 h-3" /> : i + 1}
              </div>
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs", !agent.alive && "grayscale")} style={{ backgroundColor: agent.color }}>
                {agent.name[0]}
              </div>
              <div className={cn("flex-1 text-sm", agent.alive ? "text-white" : "text-gray-500 line-through")}>
                {agent.name}
                {!agent.alive && <Skull className="w-3 h-3 inline ml-1 text-red-400" />}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{agent.score}</div>
                <div className="text-xs text-gray-400">pts</div>
              </div>
            </motion.div>
          ))}
        </div>
        <Progress value={(currentTurn / maxTurns) * 100} className="h-2 mt-4" />
      </CardContent>
    </Card>
  )
}

// ============================================
// GAME CONTROLS
// ============================================
function GameControls({ status, onStart, onNext, onSpawn, speed, onSpeed, sound, onSound, aiMode, onAi, thinking, agentCount, maxAgents, onKill, showFog, onToggleFog }: {
  status: string; onStart: () => void; onNext: () => void; onSpawn: () => void;
  speed: string; onSpeed: (s: string) => void; sound: boolean; onSound: () => void;
  aiMode: boolean; onAi: () => void; thinking: boolean; agentCount: number; maxAgents: number;
  onKill: () => void; showFog: boolean; onToggleFog: () => void;
}) {
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-white"><Target className="w-5 h-5 text-cyan-400" />Game Controls</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button className="bg-gradient-to-r from-green-600 to-emerald-600" onClick={onStart} disabled={status === 'active'}><Play className="w-4 h-4 mr-2" />{status === 'waiting' ? 'Start' : 'Reset'}</Button>
          <Button variant="outline" className="border-cyan-500/30 text-cyan-400" onClick={onNext} disabled={status !== 'active'}><SkipForward className="w-4 h-4 mr-2" />Next Turn</Button>
        </div>
        <Button variant="outline" className="w-full border-purple-500/30 text-purple-400" onClick={onSpawn} disabled={status !== 'waiting' || agentCount >= maxAgents}><Plus className="w-4 h-4 mr-2" />Spawn Agent ({agentCount}/{maxAgents})</Button>
        
        {/* NEW: Test Kill Button */}
        <Button variant="outline" className="w-full border-red-500/30 text-red-400" onClick={onKill} disabled={status !== 'active'}>
          <Skull className="w-4 h-4 mr-2" />Test Kill Event
        </Button>
        
        {/* NEW: Fog of War Toggle */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400"><Eye className="w-4 h-4 inline mr-1" />Fog of War</span>
          <Button size="sm" variant="ghost" onClick={onToggleFog} className={showFog ? "text-cyan-400" : "text-gray-500"}>
            {showFog ? 'ON' : 'OFF'}
          </Button>
        </div>
        
        <div className="flex justify-between items-center"><span className="text-sm text-gray-400"><Gauge className="w-4 h-4 inline mr-1" />Speed</span><div className="flex gap-1">{(['slow', 'normal', 'fast'] as const).map(s => <Button key={s} size="sm" variant={speed === s ? 'default' : 'ghost'} className={cn("text-xs", speed === s && "bg-cyan-600")} onClick={() => onSpeed(s)}>{s}</Button>)}</div></div>
        <div className="flex justify-between items-center"><span className="text-sm text-gray-400">{sound ? <Volume2 className="w-4 h-4 inline mr-1" /> : <VolumeX className="w-4 h-4 inline mr-1" />}Sound</span><Button size="sm" variant="ghost" onClick={onSound} className={sound ? "text-cyan-400" : "text-gray-500"}>{sound ? 'ON' : 'OFF'}</Button></div>
        <div className="flex justify-between items-center"><span className="text-sm text-gray-400"><Bot className="w-4 h-4 inline mr-1" />AI Mode</span><Button size="sm" variant="ghost" onClick={onAi} className={aiMode ? "text-purple-400" : "text-gray-500"}>{thinking ? '...' : aiMode ? 'ON' : 'OFF'}</Button></div>
      </CardContent>
    </Card>
  )
}

// ============================================
// ACTIVITY FEED
// ============================================
function ActivityFeed({ thoughts, agents }: { thoughts: Thought[]; agents: Agent[] }) {
  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-white"><Sparkles className="w-5 h-5 text-purple-400" />Agent Activity</CardTitle></CardHeader>
      <CardContent>
        <ScrollArea className="h-32">
          <div className="space-y-1">
            {thoughts.slice(-8).reverse().map((t, i) => {
              const agent = agents.find(a => a.id === t.agentId)
              if (!agent) return null
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-2 rounded bg-black/40 text-xs">
                  <span style={{ color: agent.color }}>{agent.name}</span>: <span className="text-cyan-300">{t.reasoning}</span>
                </motion.div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function AxisArena() {
  const wallet = useWallet()
  const [game, setGame] = useState<Game>({ id: 1, status: 'waiting', currentTurn: 0, maxTurns: 50, prizePool: '0.0' })
  const [agents, setAgents] = useState<Agent[]>(() => [generateMockAgent(1), generateMockAgent(2), generateMockAgent(3)])
  const [thoughts, setThoughts] = useState<Thought[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showingThought, setShowingThought] = useState<number | null>(null)
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')
  const [sound, setSound] = useState(false)
  const [aiMode, setAiMode] = useState(false)
  const [thinking, setThinking] = useState(false)
  
  // NEW: Combat and visual effect states
  const [combatLogs, setCombatLogs] = useState<CombatLogEntry[]>([])
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([])
  const [explosions, setExplosions] = useState<{id: number; x: number; y: number; color: string}[]>([])
  const [powerUps, setPowerUps] = useState<{id: number; x: number; y: number}[]>([])
  const [trails, setTrails] = useState<TrailPoint[]>([])
  const [screenShake, setScreenShake] = useState(false)
  const [showFog, setShowFog] = useState(false)
  const [exploredHexes, setExploredHexes] = useState<Set<string>>(new Set())
  const [bettingAgent, setBettingAgent] = useState<Agent | null>(null)
  const [showBettingModal, setShowBettingModal] = useState(false)
  
  const arenaRef = useRef<HTMLDivElement>(null)
  const logIdRef = useRef(0)
  const damageIdRef = useRef(0)
  const explosionIdRef = useRef(0)
  const powerUpIdRef = useRef(0)
  const trailIdRef = useRef(0)

  // NEW: Add combat log entry
  const addCombatLog = useCallback((entry: Omit<CombatLogEntry, 'id' | 'timestamp'>) => {
    const newLog: CombatLogEntry = {
      ...entry,
      id: ++logIdRef.current,
      timestamp: Date.now()
    }
    setCombatLogs(prev => [...prev, newLog])
  }, [])

  // NEW: Create damage number
  const createDamageNumber = useCallback((x: number, y: number, value: number, type: 'damage' | 'heal' | 'crit' = 'damage') => {
    const damage: DamageNumber = { id: ++damageIdRef.current, x, y, value, type }
    setDamageNumbers(prev => [...prev, damage])
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== damage.id))
    }, 1200)
  }, [])

  // NEW: Create explosion effect
  const createExplosion = useCallback((x: number, y: number, color: string) => {
    const explosion = { id: ++explosionIdRef.current, x, y, color }
    setExplosions(prev => [...prev, explosion])
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== explosion.id))
    }, 500)
  }, [])

  // NEW: Create power-up effect
  const createPowerUp = useCallback((x: number, y: number) => {
    const powerUp = { id: ++powerUpIdRef.current, x, y }
    setPowerUps(prev => [...prev, powerUp])
    setTimeout(() => {
      setPowerUps(prev => prev.filter(p => p.id !== powerUp.id))
    }, 1000)
  }, [])

  // NEW: Add trail point
  const addTrail = useCallback((x: number, y: number, color: string) => {
    const trail: TrailPoint = { id: ++trailIdRef.current, x, y, color, opacity: 0.6 }
    setTrails(prev => [...prev.slice(-50), trail]) // Keep last 50 trails
    setTimeout(() => {
      setTrails(prev => prev.filter(t => t.id !== trail.id))
    }, 500)
  }, [])

  // NEW: Trigger screen shake
  const triggerScreenShake = useCallback(() => {
    setScreenShake(true)
    setTimeout(() => setScreenShake(false), 300)
  }, [])

  // Game loop
  useEffect(() => {
    if (game.status !== 'active') return
    const interval = setInterval(() => {
      const alive = agents.filter(a => a.alive)
      if (alive.length === 0) return
      
      const agent = alive[Math.floor(Math.random() * alive.length)]
      const config = PERSONALITY_CONFIG[agent.personality]
      const thought = config.thoughts[Math.floor(Math.random() * config.thoughts.length)]
      
      // NEW: Store previous position for trail
      const prevX = agent.x
      const prevY = agent.y
      
      // NEW: Random events
      const eventRoll = Math.random()
      
      setAgents(prev => prev.map(a => {
        if (a.id !== agent.id) return a
        
        const newX = Math.max(0, Math.min(GRID_WIDTH - 1, a.x + Math.floor(Math.random() * 3) - 1))
        const newY = Math.max(0, Math.min(GRID_HEIGHT - 1, a.y + Math.floor(Math.random() * 3) - 1))
        
        // NEW: Add trail if position changed
        if (prevX !== newX || prevY !== newY) {
          const { posX, posY } = getHexPosition(prevX, prevY)
          addTrail(posX, posY, a.color)
          
          // NEW: Update explored hexes
          setExploredHexes(prevExplored => {
            const newSet = new Set(prevExplored)
            newSet.add(`${newX}-${newY}`)
            // Add visible neighbors
            for (let dx = -a.visibility; dx <= a.visibility; dx++) {
              for (let dy = -a.visibility; dy <= a.visibility; dy++) {
                newSet.add(`${newX + dx}-${newY + dy}`)
              }
            }
            return newSet
          })
        }
        
        return {
          ...a, 
          lastThought: thought,
          prevX, prevY,
          x: newX, y: newY,
          score: a.score + Math.floor(Math.random() * 10),
          energy: Math.max(0, a.energy - Math.floor(Math.random() * 5))
        }
      }))
      
      setThoughts(prev => [...prev, { agentId: agent.id, turn: game.currentTurn, reasoning: thought, action: 'move', timestamp: Date.now() }])
      setShowingThought(agent.id)
      setTimeout(() => setShowingThought(null), 2500)
      
      // NEW: Combat events (random chance)
      if (eventRoll > 0.7) {
        const target = alive.find(a => a.id !== agent.id)
        if (target) {
          const damage = Math.floor(Math.random() * 20) + 5
          const isCrit = Math.random() > 0.8
          const finalDamage = isCrit ? damage * 2 : damage
          
          // Get position for damage number
          const { posX, posY } = getHexPosition(target.x, target.y)
          createDamageNumber(posX, posY - 20, finalDamage, isCrit ? 'crit' : 'damage')
          createExplosion(posX, posY, agent.color)
          
          addCombatLog({
            turn: game.currentTurn,
            type: 'attack',
            message: `${agent.name} attacked ${target.name} for ${finalDamage} damage!${isCrit ? ' CRITICAL!' : ''}`,
            agentId: agent.id,
            targetId: target.id,
            value: finalDamage
          })
        }
      }
      
      // NEW: Pattern discovery (random chance)
      if (eventRoll < 0.1) {
        addCombatLog({
          turn: game.currentTurn,
          type: 'pattern',
          message: `${agent.name} discovered a hidden pattern! +25 pts`,
          agentId: agent.id,
          value: 25
        })
        setAgents(prev => prev.map(a => 
          a.id === agent.id ? { ...a, patterns_found: a.patterns_found + 1, score: a.score + 25 } : a
        ))
        
        const { posX, posY } = getHexPosition(agent.x, agent.y)
        createPowerUp(posX, posY)
      }
      
      // NEW: Territory capture (random chance)
      if (eventRoll > 0.85 && eventRoll <= 0.92) {
        addCombatLog({
          turn: game.currentTurn,
          type: 'territory',
          message: `${agent.name} captured new territory! +15 pts`,
          agentId: agent.id
        })
        setAgents(prev => prev.map(a => 
          a.id === agent.id ? { ...a, territories: a.territories + 1, score: a.score + 15 } : a
        ))
      }
      
    }, speed === 'slow' ? 3000 : speed === 'normal' ? 1500 : 600)
    return () => clearInterval(interval)
  }, [game.status, game.currentTurn, agents, speed, addCombatLog, createDamageNumber, createExplosion, createPowerUp, addTrail])

  const handleStart = useCallback(() => {
    setGame(prev => ({ ...prev, status: 'active', currentTurn: 0, prizePool: (Math.random() * 3 + 0.5).toFixed(2) }))
    setThoughts([])
    setCombatLogs([])
    setExploredHexes(new Set())
    
    // NEW: Initialize explored hexes from agent positions
    agents.forEach(agent => {
      setExploredHexes(prev => {
        const newSet = new Set(prev)
        newSet.add(`${agent.x}-${agent.y}`)
        for (let dx = -agent.visibility; dx <= agent.visibility; dx++) {
          for (let dy = -agent.visibility; dy <= agent.visibility; dy++) {
            newSet.add(`${agent.x + dx}-${agent.y + dy}`)
          }
        }
        return newSet
      })
    })
  }, [agents])

  const handleNext = useCallback(() => {
    setGame(prev => {
      const turn = prev.currentTurn + 1
      return { ...prev, currentTurn: turn, status: turn >= prev.maxTurns ? 'ended' : 'active' }
    })
  }, [])

  const handleSpawn = useCallback(() => {
    const id = agents.length + 1
    if (id <= 6) setAgents(prev => [...prev, generateMockAgent(id)])
  }, [agents.length])

  // NEW: Test kill event
  const handleKill = useCallback(() => {
    const alive = agents.filter(a => a.alive)
    if (alive.length <= 1) return
    
    const killer = alive[Math.floor(Math.random() * alive.length)]
    const target = alive.find(a => a.id !== killer.id)
    if (!target) return
    
    // Create effects
    const { posX, posY } = getHexPosition(target.x, target.y)
    createExplosion(posX, posY, '#ff0000')
    createDamageNumber(posX, posY - 20, 100, 'crit')
    triggerScreenShake()
    
    // Update agents
    setAgents(prev => prev.map(a => {
      if (a.id === target.id) return { ...a, alive: false, energy: 0 }
      if (a.id === killer.id) return { ...a, kills: a.kills + 1, score: a.score + 50 }
      return a
    }))
    
    // Add combat log
    addCombatLog({
      turn: game.currentTurn,
      type: 'kill',
      message: `${killer.name} eliminated ${target.name}! +50 pts`,
      agentId: killer.id,
      targetId: target.id
    })
    
    addCombatLog({
      turn: game.currentTurn,
      type: 'death',
      message: `${target.name} has been destroyed!`,
      agentId: target.id
    })
  }, [agents, game.currentTurn, createExplosion, createDamageNumber, triggerScreenShake, addCombatLog])

  // NEW: Handle place bet
  const handlePlaceBet = useCallback((agentId: number) => {
    const agent = agents.find(a => a.id === agentId)
    if (agent && agent.alive) {
      setBettingAgent(agent)
      setShowBettingModal(true)
    }
  }, [agents])

  // NEW: Handle bet confirmation
  const handleBetConfirm = useCallback((amount: string) => {
    if (bettingAgent) {
      setAgents(prev => prev.map(a => 
        a.id === bettingAgent.id 
          ? { ...a, totalBets: a.totalBets + parseFloat(amount), odds: Math.max(1.1, a.odds - 0.1) }
          : a
      ))
      addCombatLog({
        turn: game.currentTurn,
        type: 'powerup',
        message: `Bet of ${amount} ETH placed on ${bettingAgent.name}!`,
        agentId: bettingAgent.id
      })
    }
  }, [bettingAgent, game.currentTurn, addCombatLog])

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 transition-transform",
      screenShake && "animate-shake"
    )}>
      {/* NEW: Screen shake animation style */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <header className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Swords className="w-10 h-10 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AXIS ARENA</h1>
                <p className="text-xs text-gray-400">AI Agents Battle • Humans Watch & Bet</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {wallet.isConnected ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-purple-500/20 border border-purple-500/30">
                  <Wallet className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-purple-300 font-mono">{formatAddress(wallet.address)}</span>
                </div>
              ) : (
                <Button onClick={() => wallet.connect('cartridge')} disabled={wallet.isConnecting} className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <Wallet className="w-4 h-4 mr-2" />{wallet.isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </Button>
              )}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/10">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", game.status === 'active' && "bg-green-400", game.status === 'waiting' && "bg-yellow-400", game.status === 'ended' && "bg-red-400")} />
                <span className="text-sm text-white capitalize">{game.status}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold text-yellow-400">{game.prizePool} ETH</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <GameControls 
              status={game.status} 
              onStart={handleStart} 
              onNext={handleNext} 
              onSpawn={handleSpawn}
              speed={speed} 
              onSpeed={setSpeed as any} 
              sound={sound} 
              onSound={() => setSound(!sound)}
              aiMode={aiMode} 
              onAi={() => setAiMode(!aiMode)} 
              thinking={thinking} 
              agentCount={agents.length} 
              maxAgents={6}
              onKill={handleKill}
              showFog={showFog}
              onToggleFog={() => setShowFog(!showFog)}
            />
            <ActivityFeed thoughts={thoughts} agents={agents} />
            {/* NEW: Combat Log Panel */}
            <CombatLogPanel logs={combatLogs} agents={agents} />
          </div>

          <div className="lg:col-span-6">
            <Card className="bg-black/40 border-white/10 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white"><Zap className="w-5 h-5 text-yellow-400" />Battle Arena</CardTitle>
                  <div className="text-sm text-gray-400"><Timer className="w-4 h-4 inline" /> Turn {game.currentTurn}/{game.maxTurns}</div>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                <div 
                  ref={arenaRef}
                  className={cn(
                    "relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-black border border-white/5",
                    screenShake && "translate-x-0.5"
                  )}
                >
                  <svg width="100%" height="auto" viewBox={`0 0 ${GRID_WIDTH * 52 + 50} ${GRID_HEIGHT * 45 + 30}`} style={{ minHeight: 400 }}>
                    {/* NEW: Trail effects layer */}
                    <TrailEffect trails={trails} />
                    
                    {/* Hex grid */}
                    {Array.from({ length: GRID_HEIGHT }).map((_, y) =>
                      Array.from({ length: GRID_WIDTH }).map((__, x) => {
                        const agent = agents.find(a => a.x === x && a.y === y)
                        const isSelected = selectedAgent?.x === x && selectedAgent?.y === y
                        const isVisible = agents.some(a => {
                          if (!a.alive) return false
                          const dx = Math.abs(a.x - x)
                          const dy = Math.abs(a.y - y)
                          return dx <= a.visibility && dy <= a.visibility
                        })
                        const isExplored = exploredHexes.has(`${x}-${y}`)
                        return (
                          <HexCell 
                            key={`${x}-${y}`} 
                            x={x} 
                            y={y} 
                            agent={agent} 
                            isSelected={isSelected} 
                            onClick={() => agent ? setSelectedAgent(agent) : setSelectedAgent(null)}
                            isVisible={isVisible}
                            isExplored={isExplored}
                            trails={trails.filter(t => {
                              const { posX, posY } = getHexPosition(x, y)
                              return Math.abs(t.x - posX) < 30 && Math.abs(t.y - posY) < 30
                            })}
                            showFog={showFog}
                          />
                        )
                      })
                    )}
                    
                    {/* NEW: Explosion effects */}
                    <AnimatePresence>
                      {explosions.map(e => (
                        <ExplosionEffect
                          key={e.id}
                          x={e.x}
                          y={e.y}
                          color={e.color}
                          onComplete={() => setExplosions(prev => prev.filter(ex => ex.id !== e.id))}
                        />
                      ))}
                    </AnimatePresence>
                    
                    {/* NEW: Power-up effects */}
                    <AnimatePresence>
                      {powerUps.map(p => (
                        <PowerUpEffect
                          key={p.id}
                          x={p.x}
                          y={p.y}
                          onComplete={() => setPowerUps(prev => prev.filter(pu => pu.id !== p.id))}
                        />
                      ))}
                    </AnimatePresence>
                  </svg>
                  
                  {/* NEW: Floating damage numbers */}
                  <AnimatePresence>
                    {damageNumbers.map(d => (
                      <FloatingDamage key={d.id} damage={d} />
                    ))}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {showingThought && agents.find(a => a.id === showingThought) && (
                      <ThoughtBubble agent={agents.find(a => a.id === showingThought)!} onClose={() => setShowingThought(null)} />
                    )}
                  </AnimatePresence>
                  
                  {game.status === 'ended' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                      <div className="text-center">
                        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
                        <p className="text-gray-400 mb-4">Winner: {agents.filter(a => a.alive).sort((a, b) => b.score - a.score)[0]?.name || 'None'}</p>
                        <Button onClick={handleStart} className="bg-gradient-to-r from-cyan-600 to-purple-600">Play Again</Button>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {agents.map(agent => {
                    const config = PERSONALITY_CONFIG[agent.personality]
                    return (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => setSelectedAgent(agent)} 
                        className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 border cursor-pointer hover:border-white/30 transition-all",
                          agent.alive ? "border-white/10" : "border-red-500/30 opacity-40"
                        )}
                      >
                        <PixelSprite personality={agent.personality} color={agent.color} isDead={!agent.alive} />
                        <span className={cn("text-xs", agent.alive ? "text-white" : "text-gray-500 line-through")}>
                          {agent.name}
                        </span>
                        {!agent.alive && <Skull className="w-3 h-3 text-red-400" />}
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {selectedAgent ? (
              <AgentStats 
                agent={selectedAgent} 
                onClose={() => setSelectedAgent(null)} 
                onPlaceBet={() => handlePlaceBet(selectedAgent.id)}
              />
            ) : (
              <Leaderboard agents={agents} currentTurn={game.currentTurn} maxTurns={game.maxTurns} status={game.status} />
            )}
            <BettingPanel 
              agents={agents} 
              prizePool={game.prizePool} 
              onPlaceBet={handlePlaceBet}
            />
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/10 backdrop-blur-sm bg-black/40 z-20">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4"><span>Dojo Game Jam VIII</span><span>•</span><span>Built on Starknet</span><span>•</span><span>x402 Payments</span></div>
          <div className="flex items-center gap-4"><span><Users className="w-3 h-3 inline" /> {agents.filter(a => a.alive).length} Active</span><span><Skull className="w-3 h-3 inline" /> {agents.filter(a => !a.alive).length} Dead</span></div>
        </div>
      </footer>

      {/* NEW: Betting Modal */}
      <BettingModal
        isOpen={showBettingModal}
        onClose={() => setShowBettingModal(false)}
        agent={bettingAgent}
        onConfirm={handleBetConfirm}
      />
    </div>
  )
}
