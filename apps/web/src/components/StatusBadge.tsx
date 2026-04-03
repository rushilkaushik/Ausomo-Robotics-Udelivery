import type { DeliveryStatus, RobotStatus } from '../lib/types'

// Shared base classes
const BASE = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold'

// ---------------------------------------------------------------------------
// Delivery status
// ---------------------------------------------------------------------------

const DELIVERY_CONFIG: Record<DeliveryStatus, { dot: string; text: string; bg: string }> = {
  pending:      { dot: 'bg-slate-400', text: 'text-slate-700', bg: 'bg-slate-100' },
  assigned:     { dot: 'bg-amber-400',  text: 'text-amber-800', bg: 'bg-amber-50' },
  'picked-up':  { dot: 'bg-sky-400',    text: 'text-sky-800',   bg: 'bg-sky-50' },
  'in-transit': { dot: 'bg-blue-500',   text: 'text-blue-800',  bg: 'bg-blue-50' },
  arrived:      { dot: 'bg-indigo-500', text: 'text-indigo-800', bg: 'bg-indigo-50' },
  delivered:    { dot: 'bg-green-500',  text: 'text-green-800', bg: 'bg-green-50' },
  failed:       { dot: 'bg-red-500',    text: 'text-red-800',   bg: 'bg-red-50' },
  cancelled:    { dot: 'bg-red-400',    text: 'text-red-700',   bg: 'bg-red-50' },
}

const DELIVERY_LABELS: Record<DeliveryStatus, string> = {
  pending:      'Pending',
  assigned:     'Assigned',
  'picked-up':  'Picked Up',
  'in-transit': 'In Transit',
  arrived:      'Arrived',
  delivered:    'Delivered',
  failed:       'Failed',
  cancelled:    'Cancelled',
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
  const cfg = DELIVERY_CONFIG[status]
  return (
    <span className={`${BASE} ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {DELIVERY_LABELS[status]}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Robot status
// ---------------------------------------------------------------------------

const ROBOT_CONFIG: Record<RobotStatus, { dot: string; text: string; bg: string; pulse?: boolean }> = {
  idle:   { dot: 'bg-slate-400',  text: 'text-slate-700', bg: 'bg-slate-100' },
  moving: { dot: 'bg-blue-500',   text: 'text-blue-800',  bg: 'bg-blue-50', pulse: true },
  error:  { dot: 'bg-red-500',    text: 'text-red-800',   bg: 'bg-red-50' },
}

const ROBOT_LABELS: Record<RobotStatus, string> = {
  idle:   'Idle',
  moving: 'Moving',
  error:  'Error',
}

export function RobotStatusBadge({ status }: { status: RobotStatus }) {
  const cfg = ROBOT_CONFIG[status]
  return (
    <span className={`${BASE} ${cfg.bg} ${cfg.text}`}>
      <span className={`relative flex h-1.5 w-1.5 flex-shrink-0`}>
        {cfg.pulse && (
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${cfg.dot}`} />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.dot}`} />
      </span>
      {ROBOT_LABELS[status]}
    </span>
  )
}
