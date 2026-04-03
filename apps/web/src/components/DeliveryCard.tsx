import { DeliveryStatusBadge } from './StatusBadge'
import { ArrowRight, Bot, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import type { DeliveryWithDetails } from '../lib/types'
import { formatDistanceToNow } from 'date-fns'

interface DeliveryCardProps {
  delivery: DeliveryWithDetails
  selected?: boolean
  onClick: () => void
  index?: number
}

const STATUS_LEFT_BORDER: Record<string, string> = {
  'pending':    'border-l-slate-300',
  'assigned':   'border-l-amber-400',
  'picked-up':  'border-l-sky-400',
  'in-transit': 'border-l-blue-500',
  'arrived':    'border-l-indigo-500',
  'delivered':  'border-l-green-500',
  'failed':     'border-l-red-500',
  'cancelled':  'border-l-red-400',
}

export function DeliveryCard({ delivery, selected = false, onClick, index = 0 }: DeliveryCardProps) {
  const pickup  = delivery.pickup_point_name  ?? '—'
  const dropoff = delivery.dropoff_point_name ?? '—'
  const ago     = formatDistanceToNow(new Date(delivery.created_at), { addSuffix: true })
  const accent  = STATUS_LEFT_BORDER[delivery.status] ?? 'border-l-slate-300'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.04 }}
    >
      <button
        onClick={onClick}
        className={[
          'w-full text-left rounded-lg border border-slate-200 border-l-4 bg-white p-3.5',
          'transition-all duration-150',
          accent,
          selected
            ? 'shadow-md ring-2 ring-blue-500 ring-offset-1 bg-blue-50/40'
            : 'hover:shadow-sm hover:border-slate-300',
        ].join(' ')}
      >
        {/* Row 1: code + badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono text-[13px] font-semibold text-slate-800 truncate">
            {delivery.delivery_code}
          </span>
          <DeliveryStatusBadge status={delivery.status} />
        </div>

        {/* Row 2: route */}
        <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mb-2 min-w-0">
          <span className="truncate max-w-[90px]">{pickup}</span>
          <ArrowRight className="h-3 w-3 flex-shrink-0 text-slate-400" />
          <span className="truncate max-w-[90px]">{dropoff}</span>
        </div>

        {/* Row 3: robot (if assigned) */}
        {delivery.robot_name && (
          <div className="flex items-center gap-1 text-[12px] text-slate-500 mb-2">
            <Bot className="h-3 w-3 flex-shrink-0" />
            <span>{delivery.robot_name}</span>
          </div>
        )}

        {/* Progress bar for active deliveries */}
        {(delivery.status === 'in-transit' || delivery.status === 'picked-up') && (
          <div className="mt-2 mb-1">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Progress</span>
              <span className="font-medium text-blue-600">{Math.round(delivery.progress_percentage)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-500"
                style={{ width: `${delivery.progress_percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
          <Clock className="h-2.5 w-2.5" />
          <span>{ago}</span>
        </div>
      </button>
    </motion.div>
  )
}
