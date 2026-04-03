/**
 * RobotMap — 2D floor plan with live robot position overlay.
 *
 * Placeholder mode (default):
 *   Renders a generic SVG floor plan. Swap for the real map by passing
 *   `mapImageUrl` (a PNG/PGM occupancy grid stored in Supabase Storage).
 *
 * Real map mode (future):
 *   Pass `mapImageUrl` from the floor_maps record in Supabase. The image
 *   should be an occupancy grid exported from ROS `map_server` (or similar),
 *   saved as a PNG at the same resolution as the LIDAR scan.
 *
 * Coordinate system:
 *   Map coords use ROS convention — x = East, y = North, origin bottom-left.
 *   SVG Y is flipped (SVG 0,0 = top-left), handled in `toSvg()`.
 *
 *   `bounds` describes the map extent in metres. Defaults to a 15×10 m room
 *   that matches the placeholder floor plan.
 */

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, Loader2, Map } from 'lucide-react'
import type { RobotPosition, StreamStatus } from '../hooks/useDeliveryStream'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MapBounds {
  xMin: number
  yMin: number
  xMax: number
  yMax: number
}

interface AnchorMarker {
  name: string
  /** Position in map coordinates (metres) */
  x: number
  y: number
}

interface RobotMapProps {
  position: RobotPosition | null
  positionHistory?: RobotPosition[]
  streamStatus: StreamStatus
  pickupMarker?: AnchorMarker | null
  dropoffMarker?: AnchorMarker | null
  /** PNG/PGM occupancy grid URL from Supabase Storage — null = placeholder */
  mapImageUrl?: string | null
  /** Map coordinate bounds in metres */
  bounds?: MapBounds
  className?: string
}

// ---------------------------------------------------------------------------
// Default placeholder bounds
// ---------------------------------------------------------------------------

const DEFAULT_BOUNDS: MapBounds = { xMin: 0, yMin: 0, xMax: 15, yMax: 10 }

// SVG viewport dimensions
const SVG_W = 600
const SVG_H = 400

// ---------------------------------------------------------------------------
// Coordinate helpers
// ---------------------------------------------------------------------------

function toSvg(
  mx: number,
  my: number,
  bounds: MapBounds
): { x: number; y: number } {
  const rangeX = bounds.xMax - bounds.xMin
  const rangeY = bounds.yMax - bounds.yMin
  return {
    x: ((mx - bounds.xMin) / rangeX) * SVG_W,
    // Flip Y: map Y increases upward, SVG Y increases downward
    y: SVG_H - ((my - bounds.yMin) / rangeY) * SVG_H,
  }
}

// ---------------------------------------------------------------------------
// Placeholder floor plan (SVG)
// Represents a 15 × 10 m building floor (one wing of a typical office).
// ---------------------------------------------------------------------------

function PlaceholderFloorPlan({ bounds }: { bounds: MapBounds }) {
  // Helper: room rect in map coords → SVG coords + size
  function room(mx: number, my: number, mw: number, mh: number) {
    const tl = toSvg(mx, my + mh, bounds)
    const br = toSvg(mx + mw, my, bounds)
    return { x: tl.x, y: tl.y, w: br.x - tl.x, h: br.y - tl.y }
  }

  const rooms = [
    { id: 'reception', label: 'Reception',  ...room(0, 0, 4, 3.5) },
    { id: 'corridor',  label: 'Corridor',   ...room(4, 0, 5, 10)   },
    { id: 'roomA',     label: 'Room A',     ...room(0, 3.5, 4, 3)  },
    { id: 'roomB',     label: 'Room B',     ...room(0, 6.5, 4, 3.5) },
    { id: 'roomC',     label: 'Room C',     ...room(9, 6.5, 6, 3.5) },
    { id: 'roomD',     label: 'Room D',     ...room(9, 3.5, 6, 3)  },
    { id: 'roomE',     label: 'Room E',     ...room(9, 0, 6, 3.5)  },
  ]

  // Scale bar: 5 m
  const scaleLeft  = toSvg(0.5, 0.4, bounds)
  const scaleRight = toSvg(5.5, 0.4, bounds)

  return (
    <g>
      {/* Background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#f1f5f9" />

      {/* Outer wall */}
      <rect
        x={1} y={1}
        width={SVG_W - 2} height={SVG_H - 2}
        rx={4}
        fill="#e2e8f0"
        stroke="#94a3b8"
        strokeWidth={2}
      />

      {/* Rooms */}
      {rooms.map((r) => (
        <g key={r.id}>
          <rect
            x={r.x + 1} y={r.y + 1}
            width={r.w - 2} height={r.h - 2}
            rx={2}
            fill={r.id === 'corridor' ? '#dde5ef' : '#ffffff'}
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray={r.id === 'corridor' ? '4 3' : undefined}
          />
          <text
            x={r.x + r.w / 2}
            y={r.y + r.h / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={r.id === 'corridor' ? '#94a3b8' : '#64748b'}
            fontSize={r.id === 'corridor' ? 10 : 11}
            fontWeight={r.id === 'corridor' ? 400 : 500}
            fontFamily="system-ui, sans-serif"
          >
            {r.label}
          </text>
        </g>
      ))}

      {/* Scale bar */}
      <line
        x1={scaleLeft.x} y1={scaleLeft.y}
        x2={scaleRight.x} y2={scaleRight.y}
        stroke="#94a3b8" strokeWidth={1.5}
      />
      <line x1={scaleLeft.x}  y1={scaleLeft.y - 4}  x2={scaleLeft.x}  y2={scaleLeft.y + 4}  stroke="#94a3b8" strokeWidth={1.5} />
      <line x1={scaleRight.x} y1={scaleRight.y - 4} x2={scaleRight.x} y2={scaleRight.y + 4} stroke="#94a3b8" strokeWidth={1.5} />
      <text
        x={(scaleLeft.x + scaleRight.x) / 2}
        y={scaleLeft.y - 7}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={9}
        fontFamily="system-ui, sans-serif"
      >
        5 m
      </text>

      {/* Placeholder watermark */}
      <text
        x={SVG_W - 8} y={SVG_H - 8}
        textAnchor="end"
        fill="#cbd5e1"
        fontSize={9}
        fontFamily="system-ui, sans-serif"
      >
        Placeholder — upload LIDAR map to replace
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Anchor markers
// ---------------------------------------------------------------------------

function AnchorPin({
  marker,
  bounds,
  color,
  label,
}: {
  marker: AnchorMarker
  bounds: MapBounds
  color: string
  label: 'P' | 'D'
}) {
  const { x, y } = toSvg(marker.x, marker.y, bounds)
  return (
    <g>
      {/* Pin drop shadow */}
      <circle cx={x} cy={y + 1} r={9} fill="rgba(0,0,0,0.12)" />
      {/* Pin body */}
      <circle cx={x} cy={y} r={9} fill={color} />
      <text
        x={x} y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={9}
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
      {/* Name label */}
      <rect
        x={x - marker.name.length * 3 - 4}
        y={y - 24}
        width={marker.name.length * 6 + 8}
        height={14}
        rx={3}
        fill="white"
        stroke={color}
        strokeWidth={1}
      />
      <text
        x={x} y={y - 17}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={8}
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
      >
        {marker.name}
      </text>
    </g>
  )
}

// ---------------------------------------------------------------------------
// Robot marker
// ---------------------------------------------------------------------------

function RobotMarker({ pos, bounds }: { pos: RobotPosition; bounds: MapBounds }) {
  const { x, y } = toSvg(pos.x, pos.y, bounds)
  // Direction arrow tip in SVG space
  const arrowLen = 18
  const tx = x + Math.cos(pos.theta) * arrowLen
  const ty = y - Math.sin(pos.theta) * arrowLen  // flip Y

  return (
    <g>
      {/* Outer pulse ring */}
      <motion.circle
        cx={x} cy={y} r={16}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={1.5}
        initial={{ r: 10, opacity: 0.8 }}
        animate={{ r: 20, opacity: 0 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
      />
      {/* Shadow */}
      <circle cx={x} cy={y + 2} r={10} fill="rgba(0,0,0,0.15)" />
      {/* Body */}
      <circle cx={x} cy={y} r={10} fill="#2563eb" />
      <circle cx={x} cy={y} r={7}  fill="#3b82f6" />
      {/* Direction indicator */}
      <line
        x1={x} y1={y}
        x2={tx} y2={ty}
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Robot icon dot */}
      <circle cx={x} cy={y} r={2} fill="white" />
    </g>
  )
}

// ---------------------------------------------------------------------------
// Path trail
// ---------------------------------------------------------------------------

function PathTrail({ history, bounds }: { history: RobotPosition[]; bounds: MapBounds }) {
  if (history.length < 2) return null
  const points = history
    .map((p) => {
      const { x, y } = toSvg(p.x, p.y, bounds)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <polyline
      points={points}
      fill="none"
      stroke="#93c5fd"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="4 3"
      opacity={0.7}
    />
  )
}

// ---------------------------------------------------------------------------
// Connection status overlay
// ---------------------------------------------------------------------------

function StreamStatusOverlay({ status, error }: { status: StreamStatus; error: string | null }) {
  if (status === 'connected') return null

  const configs = {
    idle:        { icon: <Map className="h-4 w-4" />,       label: 'Not connected',    bg: 'bg-slate-700/80' },
    connecting:  { icon: <Loader2 className="h-4 w-4 animate-spin" />, label: 'Connecting…', bg: 'bg-blue-700/80' },
    reconnecting:{ icon: <Loader2 className="h-4 w-4 animate-spin" />, label: 'Reconnecting…', bg: 'bg-amber-700/80' },
    error:       { icon: <WifiOff className="h-4 w-4" />,   label: error ?? 'Connection error', bg: 'bg-red-700/80' },
    connected:   { icon: <Wifi className="h-4 w-4" />,      label: 'Live',             bg: 'bg-green-700/80' },
  }

  const cfg = configs[status]

  return (
    <div className={`absolute inset-0 flex items-center justify-center rounded-lg pointer-events-none`}>
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-slate-900/30 rounded-lg" />
      <div className={`relative flex items-center gap-2 ${cfg.bg} text-white text-xs font-medium px-3 py-2 rounded-full shadow-lg`}>
        {cfg.icon}
        {cfg.label}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RobotMap
// ---------------------------------------------------------------------------

export function RobotMap({
  position,
  positionHistory = [],
  streamStatus,
  pickupMarker,
  dropoffMarker,
  mapImageUrl,
  bounds = DEFAULT_BOUNDS,
  className = '',
}: RobotMapProps) {
  return (
    <div className={`relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 ${className}`}>
      {/* Connected indicator */}
      {streamStatus === 'connected' && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5 bg-green-600 text-white text-[11px] font-semibold px-2 py-1 rounded-full shadow">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Live
        </div>
      )}

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full h-auto"
        style={{ display: 'block' }}
      >
        {mapImageUrl ? (
          /* Real occupancy grid from Supabase Storage */
          <image
            href={mapImageUrl}
            x={0} y={0}
            width={SVG_W} height={SVG_H}
            preserveAspectRatio="xMidYMid meet"
            style={{ imageRendering: 'pixelated' }}
          />
        ) : (
          <PlaceholderFloorPlan bounds={bounds} />
        )}

        {/* Path trail behind the robot */}
        <PathTrail history={positionHistory} bounds={bounds} />

        {/* Anchor markers */}
        {pickupMarker && (
          <AnchorPin marker={pickupMarker} bounds={bounds} color="#16a34a" label="P" />
        )}
        {dropoffMarker && (
          <AnchorPin marker={dropoffMarker} bounds={bounds} color="#dc2626" label="D" />
        )}

        {/* Robot */}
        <AnimatePresence>
          {position && (
            <motion.g
              key="robot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RobotMarker pos={position} bounds={bounds} />
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Connection status overlay (non-connected states) */}
      <StreamStatusOverlay status={streamStatus} error={null} />
    </div>
  )
}
