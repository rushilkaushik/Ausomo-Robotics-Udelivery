import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchAdminDeliveries, fetchBuildingRobots, fetchBuilding } from '../lib/queries'
import type { DeliveryWithDetails, Robot, Building } from '../lib/types'
import { AppHeader } from './AppHeader'
import { DeliveryCard } from './DeliveryCard'
import { RobotCard } from './RobotCard'
import { DeliveryStatusBadge } from './StatusBadge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import {
  Bot, Package, Clock, CheckCircle, AlertCircle,
  RefreshCw, MapPin, Building as BuildingIcon, ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  iconBg: string
  border: string
  delay?: number
}

function StatCard({ label, value, icon, iconBg, border, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
    >
      <div className={`bg-white rounded-xl border border-slate-200 border-t-4 shadow-sm p-5 ${border}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// AdminDeliveryDetail
// ---------------------------------------------------------------------------

function AdminDeliveryDetail({ delivery }: { delivery: DeliveryWithDetails }) {
  const ts = (s: string | null) => s ? format(new Date(s), 'MMM d, h:mm a') : '—'

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header strip */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono font-bold text-slate-900">{delivery.delivery_code}</p>
            <p className="text-[12px] text-slate-400 mt-0.5">
              {formatDistanceToNow(new Date(delivery.created_at), { addSuffix: true })}
            </p>
          </div>
          <DeliveryStatusBadge status={delivery.status} />
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mt-3 text-[13px]">
          <div className="flex items-center gap-1 text-slate-600 min-w-0">
            <MapPin className="h-3 w-3 text-slate-400 flex-shrink-0" />
            <span className="truncate">{delivery.pickup_point_name ?? '—'}</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
          <div className="flex items-center gap-1 text-slate-600 min-w-0">
            <MapPin className="h-3 w-3 text-blue-400 flex-shrink-0" />
            <span className="truncate">{delivery.dropoff_point_name ?? '—'}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Progress</span>
            <span className="font-semibold text-blue-600">{Math.round(delivery.progress_percentage)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${delivery.progress_percentage}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
        {[
          { label: 'Building', value: delivery.building_name ?? '—', icon: <BuildingIcon className="h-3 w-3" /> },
          { label: 'Floor',    value: delivery.floor_name ?? '—' },
          { label: 'Robot',    value: delivery.robot_name ?? 'Unassigned', icon: <Bot className="h-3 w-3" /> },
          { label: 'Created',  value: ts(delivery.created_at) },
          ...(delivery.delivered_at
            ? [{ label: 'Delivered', value: ts(delivery.delivered_at), valueClass: 'text-green-700 font-semibold' }]
            : delivery.estimated_delivery_time
            ? [{ label: 'ETA', value: ts(delivery.estimated_delivery_time), valueClass: 'text-blue-700 font-semibold' }]
            : []),
        ].map(({ label, value, icon, valueClass }) => (
          <div key={label}>
            <p className="text-slate-400 text-[11px] mb-0.5 flex items-center gap-1">
              {icon}
              {label}
            </p>
            <p className={`font-medium text-slate-800 ${valueClass ?? ''}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
        {icon}
      </div>
      <p className="text-[13px] text-slate-500">{message}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// AdminDashboard
// ---------------------------------------------------------------------------

export function AdminDashboard() {
  const { user, signOut } = useAuth()

  const [deliveries, setDeliveries]             = useState<DeliveryWithDetails[]>([])
  const [robots, setRobots]                     = useState<Robot[]>([])
  const [building, setBuilding]                 = useState<Building | null>(null)
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null)
  const [isLoading, setIsLoading]               = useState(true)
  const [tab, setTab]                           = useState('overview')

  const load = async () => {
    if (!user?.building_id) return
    setIsLoading(true)
    try {
      const [d, r, b] = await Promise.all([
        fetchAdminDeliveries(user.building_id),
        fetchBuildingRobots(user.building_id),
        fetchBuilding(user.building_id),
      ])
      setDeliveries(d)
      setRobots(r)
      setBuilding(b)
      if (d.length > 0) setSelectedDeliveryId(d[0].id)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [user])

  if (!user) return null

  const activeRobots = robots.filter((r) => r.status === 'moving').length
  const idleRobots   = robots.filter((r) => r.status === 'idle').length
  const errorRobots  = robots.filter((r) => r.status === 'error').length
  const inTransit    = deliveries.filter((d) => d.status === 'in-transit' || d.status === 'picked-up').length
  const pending      = deliveries.filter((d) => d.status === 'pending' || d.status === 'assigned').length
  const delivered    = deliveries.filter((d) => d.status === 'delivered').length

  const robotDeliveryMap: Record<string, string> = {}
  for (const d of deliveries) {
    if (d.robot_id) robotDeliveryMap[d.robot_id] = d.delivery_code
  }

  const selectedDelivery = deliveries.find((d) => d.id === selectedDeliveryId)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader user={user} buildingName={building?.name} onLogout={signOut} />

      <div className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-6 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label="Active Robots"
            value={`${activeRobots} / ${robots.length}`}
            icon={<Bot className="h-4 w-4 text-blue-600" />}
            iconBg="bg-blue-100"
            border="border-t-blue-500"
            delay={0}
          />
          <StatCard
            label="Idle"
            value={idleRobots}
            icon={<Bot className="h-4 w-4 text-slate-500" />}
            iconBg="bg-slate-100"
            border="border-t-slate-400"
            delay={0.04}
          />
          <StatCard
            label="In Transit"
            value={inTransit}
            icon={<Package className="h-4 w-4 text-blue-600" />}
            iconBg="bg-blue-100"
            border="border-t-blue-500"
            delay={0.08}
          />
          <StatCard
            label="Pending"
            value={pending}
            icon={<Clock className="h-4 w-4 text-amber-600" />}
            iconBg="bg-amber-100"
            border="border-t-amber-400"
            delay={0.12}
          />
          <StatCard
            label="Delivered"
            value={delivered}
            icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            iconBg="bg-green-100"
            border="border-t-green-500"
            delay={0.16}
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {isLoading && (
            <span className="text-[12px] text-slate-400">Loading data…</span>
          )}
        </div>

        {/* ── Tabs ── */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-white border border-slate-200 shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              Deliveries
              <span className="ml-1.5 bg-slate-200 text-slate-600 text-[11px] font-semibold px-1.5 py-0.5 rounded-full">
                {deliveries.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="robots" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              Robots
              <span className="ml-1.5 bg-slate-200 text-slate-600 text-[11px] font-semibold px-1.5 py-0.5 rounded-full">
                {robots.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-5">
            <div className="grid md:grid-cols-2 gap-5">

              {/* Robot fleet card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Bot className="h-4 w-4 text-slate-500" />
                  <h3 className="font-semibold text-slate-800 text-sm">Robot Fleet</h3>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: 'Moving', value: activeRobots, color: 'text-blue-600', bar: 'bg-blue-500' },
                    { label: 'Idle',   value: idleRobots,   color: 'text-slate-600', bar: 'bg-slate-400' },
                    { label: 'Error',  value: errorRobots,  color: 'text-red-600',   bar: 'bg-red-500'  },
                  ].map(({ label, value, color, bar }) => (
                    <div key={label}>
                      <div className="flex justify-between text-[13px] mb-1">
                        <span className="text-slate-500">{label}</span>
                        <span className={`font-semibold ${color}`}>{value}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div
                          className={`${bar} h-1 rounded-full transition-all duration-500`}
                          style={{ width: robots.length > 0 ? `${(value / robots.length) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-[13px] font-semibold text-slate-700">
                    <span>Total</span>
                    <span>{robots.length}</span>
                  </div>
                </div>
              </div>

              {/* Delivery summary card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  <h3 className="font-semibold text-slate-800 text-sm">Delivery Summary</h3>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: 'In Transit',        value: inTransit, color: 'text-blue-600',   bar: 'bg-blue-500'  },
                    { label: 'Pending / Assigned', value: pending,   color: 'text-amber-600',  bar: 'bg-amber-400' },
                    { label: 'Delivered',          value: delivered, color: 'text-green-600',  bar: 'bg-green-500' },
                    {
                      label: 'Failed / Cancelled',
                      value: deliveries.filter((d) => d.status === 'failed' || d.status === 'cancelled').length,
                      color: 'text-red-600',
                      bar:   'bg-red-500',
                    },
                  ].map(({ label, value, color, bar }) => (
                    <div key={label}>
                      <div className="flex justify-between text-[13px] mb-1">
                        <span className="text-slate-500">{label}</span>
                        <span className={`font-semibold ${color}`}>{value}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1">
                        <div
                          className={`${bar} h-1 rounded-full transition-all duration-500`}
                          style={{ width: deliveries.length > 0 ? `${(value / deliveries.length) * 100}%` : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                  <Separator className="my-2" />
                  <div className="flex justify-between text-[13px] font-semibold text-slate-700">
                    <span>Total</span>
                    <span>{deliveries.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Deliveries */}
          <TabsContent value="deliveries" className="mt-5">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-[90px] rounded-lg bg-slate-200 animate-pulse" />
                  ))}
                </div>
                <div className="h-64 rounded-xl bg-slate-200 animate-pulse" />
              </div>
            ) : deliveries.length === 0 ? (
              <EmptyState
                icon={<Package className="h-7 w-7" />}
                message="No deliveries found for this building."
              />
            ) : (
              <div className="grid md:grid-cols-[1fr_1.3fr] gap-5">
                <div className="space-y-2 overflow-y-auto max-h-[68vh] pr-1">
                  {deliveries.map((d, i) => (
                    <DeliveryCard
                      key={d.id}
                      delivery={d}
                      selected={d.id === selectedDeliveryId}
                      onClick={() => setSelectedDeliveryId(d.id)}
                      index={i}
                    />
                  ))}
                </div>
                <div className="sticky top-4">
                  {selectedDelivery ? (
                    <AdminDeliveryDetail delivery={selectedDelivery} />
                  ) : (
                    <EmptyState icon={<Package className="h-7 w-7" />} message="Select a delivery to view details." />
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Robots */}
          <TabsContent value="robots" className="mt-5">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-28 rounded-xl bg-slate-200 animate-pulse" />
                ))}
              </div>
            ) : robots.length === 0 ? (
              <EmptyState
                icon={<AlertCircle className="h-7 w-7" />}
                message="No robots found for this building."
              />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {robots.map((r, i) => (
                  <RobotCard
                    key={r.robot_id}
                    robot={r}
                    assignedDeliveryCode={robotDeliveryMap[r.robot_id] ?? null}
                    index={i}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
