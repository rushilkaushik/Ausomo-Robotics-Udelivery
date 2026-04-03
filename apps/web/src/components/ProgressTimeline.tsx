import { Check, Clock, Package, Truck, MapPin, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import type { DeliveryWithDetails } from '../lib/types'
import { format } from 'date-fns'

interface TimelineStep {
  label: string
  description: string
  timestamp: string | null
  status: 'completed' | 'current' | 'pending'
}

interface ProgressTimelineProps {
  currentStep: number
  delivery: DeliveryWithDetails
}

function fmtTs(ts: string | null): string | null {
  if (!ts) return null
  return format(new Date(ts), 'MMM d, h:mm a')
}

export function ProgressTimeline({ currentStep, delivery }: ProgressTimelineProps) {
  const pickup  = delivery.pickup_point_name  ?? 'Pickup'
  const dropoff = delivery.dropoff_point_name ?? 'Destination'

  const steps: TimelineStep[] = [
    {
      label:       'Pending',
      description: 'Delivery request created',
      timestamp:   fmtTs(delivery.created_at),
      status:      currentStep >= 1 ? 'completed' : 'current',
    },
    {
      label:       'Assigned',
      description: delivery.robot_name ? `Robot: ${delivery.robot_name}` : 'Awaiting robot assignment',
      timestamp:   null,
      status:      currentStep >= 2 ? 'completed' : currentStep === 1 ? 'current' : 'pending',
    },
    {
      label:       'Picked Up',
      description: `Collected at ${pickup}`,
      timestamp:   fmtTs(delivery.picked_up_at),
      status:      currentStep >= 3 ? 'completed' : currentStep === 2 ? 'current' : 'pending',
    },
    {
      label:       'In Transit',
      description: `En route to ${dropoff}`,
      timestamp:   fmtTs(delivery.in_transit_at),
      status:      currentStep >= 4 ? 'completed' : currentStep === 3 ? 'current' : 'pending',
    },
    {
      label:       'Arrived',
      description: `At ${dropoff}`,
      timestamp:   fmtTs(delivery.arrived_at),
      status:      currentStep >= 5 ? 'completed' : currentStep === 4 ? 'current' : 'pending',
    },
    {
      label:       'Delivered',
      description: 'Package successfully delivered',
      timestamp:   fmtTs(delivery.delivered_at),
      status:      currentStep >= 6 ? 'completed' : currentStep === 5 ? 'current' : 'pending',
    },
  ]

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <motion.div
            key={step.label}
            className="flex gap-3"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
          >
            {/* Spine */}
            <div className="flex flex-col items-center w-6 flex-shrink-0">
              {/* Dot */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 ${
                step.status === 'completed'
                  ? 'bg-green-500 border-green-500'
                  : step.status === 'current'
                  ? 'bg-white border-blue-500'
                  : 'bg-white border-slate-200'
              }`}>
                {step.status === 'completed' ? (
                  <Check className="h-3 w-3 text-white" />
                ) : step.status === 'current' ? (
                  <motion.span
                    className="w-2 h-2 rounded-full bg-blue-500 block"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200 block" />
                )}
              </div>
              {/* Connector line */}
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[20px] mt-0.5 ${
                  step.status === 'completed' ? 'bg-green-300' : 'bg-slate-100'
                }`} />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-4 ${isLast ? 'pb-0' : ''}`}>
              <div className="flex items-baseline justify-between gap-2 pt-0.5">
                <p className={`text-[13px] font-semibold leading-none ${
                  step.status === 'current'
                    ? 'text-blue-600'
                    : step.status === 'completed'
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}>
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-[11px] text-slate-400 whitespace-nowrap">{step.timestamp}</p>
                )}
              </div>
              <p className={`text-[12px] mt-0.5 ${
                step.status === 'pending' ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {step.description}
              </p>
              {step.status === 'current' && (
                <motion.p
                  className="text-[11px] text-blue-400 mt-1"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  In progress…
                </motion.p>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
