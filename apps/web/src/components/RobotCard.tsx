import { RobotStatusBadge } from './StatusBadge'
import { Bot, MapPin, Package, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Robot } from '../lib/types'
import { formatDistanceToNow } from 'date-fns'

interface RobotCardProps {
  robot: Robot
  assignedDeliveryCode?: string | null
  index?: number
}

const STATUS_ACCENT: Record<string, string> = {
  moving: 'border-t-blue-500',
  idle:   'border-t-slate-300',
  error:  'border-t-red-500',
}

export function RobotCard({ robot, assignedDeliveryCode, index = 0 }: RobotCardProps) {
  const updatedAgo = formatDistanceToNow(new Date(robot.updated_at), { addSuffix: true })
  const accent = STATUS_ACCENT[robot.status] ?? 'border-t-slate-300'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <div className={`rounded-lg border border-slate-200 border-t-4 bg-white p-4 shadow-sm ${accent}`}>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              robot.status === 'moving' ? 'bg-blue-100' :
              robot.status === 'error'  ? 'bg-red-100'  : 'bg-slate-100'
            }`}>
              <Bot className={`h-5 w-5 ${
                robot.status === 'moving' ? 'text-blue-600' :
                robot.status === 'error'  ? 'text-red-600'  : 'text-slate-500'
              }`} />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-800 leading-none">{robot.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Updated {updatedAgo}</p>
            </div>
          </div>
          <RobotStatusBadge status={robot.status} />
        </div>

        {/* Detail rows */}
        <div className="space-y-1.5 text-[12px]">
          {robot.current_location && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="truncate">{robot.current_location}</span>
            </div>
          )}

          {robot.speed != null && robot.speed > 0 && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Zap className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span>{robot.speed} m/s</span>
            </div>
          )}

          {assignedDeliveryCode && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <Package className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="font-mono text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                {assignedDeliveryCode}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
