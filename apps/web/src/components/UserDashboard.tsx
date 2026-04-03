import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchUserDeliveries, fetchBuilding } from '../lib/queries'
import { useDeliveryStream } from '../hooks/useDeliveryStream'
import type { DeliveryWithDetails, Building } from '../lib/types'
import { AppHeader } from './AppHeader'
import { DeliveryCard } from './DeliveryCard'
import { DeliveryStatusBadge } from './StatusBadge'
import { DeliveryForm } from './DeliveryForm'
import { RobotAnimation } from './RobotAnimation'
import { ProgressTimeline } from './ProgressTimeline'
import { RobotMap } from './RobotMap'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import {
  Package, Plus, RefreshCw, Bot, MapPin, Clock,
  Building as BuildingIcon, ArrowRight, Map, Activity,
  Wifi, WifiOff, Loader2,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { motion } from 'framer-motion'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStepFromStatus(status: DeliveryWithDetails['status']): number {
  switch (status) {
    case 'pending':    return 0
    case 'assigned':   return 1
    case 'picked-up':  return 2
    case 'in-transit': return 3
    case 'arrived':    return 4
    case 'delivered':  return 5
    default:           return 0
  }
}

function fmt(ts: string | null) {
  if (!ts) return '—'
  return format(new Date(ts), 'MMM d, h:mm a')
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
      {title}
    </p>
  )
}

// ---------------------------------------------------------------------------
// Info row
// ---------------------------------------------------------------------------

function InfoRow({ label, value, icon, valueClass = '' }: {
  label: string
  value: string
  icon?: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="flex items-center gap-1.5 text-[13px] text-slate-500 flex-shrink-0">
        {icon}
        {label}
      </span>
      <span className={`text-[13px] font-medium text-slate-800 text-right ${valueClass}`}>
        {value}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// View toggle (Animation | Live Map)
// ---------------------------------------------------------------------------

type TrackingView = 'animation' | 'map'

function ViewToggle({ view, onChange }: { view: TrackingView; onChange: (v: TrackingView) => void }) {
  return (
    <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
      {([
        { id: 'animation', label: 'Animation', icon: <Activity className="h-3.5 w-3.5" /> },
        { id: 'map',       label: 'Live Map',  icon: <Map       className="h-3.5 w-3.5" /> },
      ] as const).map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-all',
            view === opt.id
              ? 'bg-white shadow-sm text-slate-800'
              : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stream status pill
// ---------------------------------------------------------------------------

function StreamPill({ status }: { status: ReturnType<typeof useDeliveryStream>['streamStatus'] }) {
  if (status === 'idle') return null

  const cfgs = {
    connecting:   { icon: <Loader2 className="h-3 w-3 animate-spin" />, label: 'Connecting',  cls: 'bg-blue-100 text-blue-700' },
    connected:    { icon: <Wifi    className="h-3 w-3" />,              label: 'Live',         cls: 'bg-green-100 text-green-700' },
    reconnecting: { icon: <Loader2 className="h-3 w-3 animate-spin" />, label: 'Reconnecting', cls: 'bg-amber-100 text-amber-700' },
    error:        { icon: <WifiOff className="h-3 w-3" />,              label: 'Disconnected', cls: 'bg-red-100 text-red-700' },
    idle:         { icon: null, label: '', cls: '' },
  }

  const { icon, label, cls } = cfgs[status]
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>
      {icon}{label}
    </span>
  )
}

// ---------------------------------------------------------------------------
// DeliveryDetailPanel
// ---------------------------------------------------------------------------

interface DeliveryDetailPanelProps {
  delivery: DeliveryWithDetails
  stream: ReturnType<typeof useDeliveryStream>
}

function DeliveryDetailPanel({ delivery, stream }: DeliveryDetailPanelProps) {
  const step = getStepFromStatus(delivery.status)
  const [view, setView] = useState<TrackingView>('animation')

  return (
    <div className="space-y-5">

      {/* ── Title card ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="font-mono text-lg font-bold text-slate-900 leading-none mb-1">
              {delivery.delivery_code}
            </p>
            <p className="text-[13px] text-slate-400">
              Created {formatDistanceToNow(new Date(delivery.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StreamPill status={stream.streamStatus} />
            <DeliveryStatusBadge status={delivery.status} />
          </div>
        </div>

        {/* Route pill */}
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 text-sm mb-4">
          <MapPin className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
          <span className="font-medium text-slate-700 truncate">{delivery.pickup_point_name ?? '—'}</span>
          <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <MapPin className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
          <span className="font-medium text-slate-700 truncate">{delivery.dropoff_point_name ?? '—'}</span>
        </div>

        {/* Progress bar */}
        {delivery.status !== 'delivered' && (
          <div>
            <div className="flex justify-between text-[12px] text-slate-400 mb-1.5">
              <span>Overall progress</span>
              <span className="font-semibold text-blue-600">{Math.round(delivery.progress_percentage)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${delivery.progress_percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Tracking view ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Robot Tracking" />
          <ViewToggle view={view} onChange={setView} />
        </div>

        {view === 'animation' ? (
          <RobotAnimation
            status={delivery.status}
            batteryLevel={100}
            progress={delivery.progress_percentage}
            currentStep={step}
            currentLocation={delivery.pickup_point_name ?? ''}
          />
        ) : (
          <div className="space-y-3">
            <RobotMap
              position={stream.position}
              positionHistory={stream.positionHistory}
              streamStatus={stream.streamStatus}
              pickupMarker={
                delivery.pickup_point_name
                  ? { name: delivery.pickup_point_name, x: 2, y: 1.5 }  // placeholder coords
                  : null
              }
              dropoffMarker={
                delivery.dropoff_point_name
                  ? { name: delivery.dropoff_point_name, x: 12, y: 7.5 }
                  : null
              }
              className="w-full"
            />

            {/* Live position readout */}
            {stream.position && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 bg-slate-50 rounded-lg px-3 py-2 text-[12px] font-mono text-slate-600"
              >
                <span>x: <strong>{stream.position.x.toFixed(2)} m</strong></span>
                <span>y: <strong>{stream.position.y.toFixed(2)} m</strong></span>
                <span>θ: <strong>{((stream.position.theta * 180) / Math.PI).toFixed(1)}°</strong></span>
              </motion.div>
            )}

            {stream.error && (
              <p className="text-[12px] text-red-500 text-center">{stream.error}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Timeline ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <SectionHeader title="Journey Progress" />
        <ProgressTimeline currentStep={step} delivery={delivery} />
      </div>

      {/* ── Delivery details ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <SectionHeader title="Delivery Details" />
        <div className="divide-y divide-slate-100">
          <InfoRow label="Building" value={delivery.building_name ?? '—'} icon={<BuildingIcon className="h-3.5 w-3.5" />} />
          <InfoRow label="Floor"    value={delivery.floor_name ?? '—'} />
          <InfoRow label="Created"  value={fmt(delivery.created_at)} icon={<Clock className="h-3.5 w-3.5" />} />
          {delivery.picked_up_at    && <InfoRow label="Picked Up"  value={fmt(delivery.picked_up_at)} />}
          {delivery.in_transit_at   && <InfoRow label="In Transit" value={fmt(delivery.in_transit_at)} />}
          {delivery.delivered_at    && <InfoRow label="Delivered"  value={fmt(delivery.delivered_at)} valueClass="text-green-700" />}
          {delivery.estimated_delivery_time && !delivery.delivered_at && (
            <InfoRow label="ETA" value={fmt(delivery.estimated_delivery_time)} valueClass="text-blue-700" />
          )}
        </div>
      </div>

      {/* ── Assigned robot ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <SectionHeader title="Assigned Robot" />
        {delivery.robot_name ? (
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{delivery.robot_name}</p>
              {delivery.robot_status && (
                <p className="text-[12px] text-slate-500 capitalize">{delivery.robot_status}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[13px] text-slate-500 bg-slate-50 rounded-lg px-3 py-2.5">
            <Bot className="h-4 w-4 text-slate-400" />
            Awaiting robot assignment
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// UserDashboard
// ---------------------------------------------------------------------------

export function UserDashboard() {
  const { user, signOut } = useAuth()

  const [deliveries, setDeliveries]         = useState<DeliveryWithDetails[]>([])
  const [building, setBuilding]             = useState<Building | null>(null)
  const [selectedId, setSelectedId]         = useState<string | null>(null)
  const [isLoading, setIsLoading]           = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const loadDeliveries = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await fetchUserDeliveries(user.id)
      setDeliveries(data)
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { loadDeliveries() }, [user])
  useEffect(() => {
    if (!user?.building_id) return
    fetchBuilding(user.building_id).then(setBuilding)
  }, [user])

  // ── WebSocket stream for the active delivery ─────────────────────────────
  const activeDelivery = deliveries.find((d) => d.id === selectedId) ?? deliveries[0] ?? null
  const stream = useDeliveryStream(activeDelivery?.id ?? null)

  if (!user) return null

  // ── Create form ───────────────────────────────────────────────────────────
  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader user={user} buildingName={building?.name} onLogout={signOut} />
        <div className="flex items-center justify-center p-8">
          <DeliveryForm
            onSuccess={async (deliveryId) => {
              setShowCreateForm(false)
              await loadDeliveries()
              setSelectedId(deliveryId)
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader user={user} buildingName={building?.name} onLogout={signOut} />

      <div className="flex-1 flex min-h-0 max-w-screen-xl mx-auto w-full">

        {/* ── Sidebar ── */}
        <aside className="w-72 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col">
          {/* Header */}
          <div className="px-4 pt-5 pb-3 flex items-center justify-between border-b border-slate-100">
            <div>
              <p className="font-semibold text-slate-900 text-sm">My Deliveries</p>
              <p className="text-[12px] text-slate-400 mt-0.5">{deliveries.length} total</p>
            </div>
            <Button size="sm" onClick={() => setShowCreateForm(true)} className="h-8 px-3 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              New
            </Button>
          </div>

          {/* Refresh */}
          <div className="px-4 py-2 border-b border-slate-100">
            <button
              onClick={loadDeliveries}
              disabled={isLoading}
              className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="h-[88px] rounded-lg bg-slate-100 animate-pulse" />
              ))
            ) : deliveries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Package className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">No deliveries yet</p>
                <p className="text-[12px] text-slate-400 mb-4">Create one to get started</p>
                <Button size="sm" onClick={() => setShowCreateForm(true)} className="h-8 px-3 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Create Delivery
                </Button>
              </div>
            ) : (
              deliveries.map((d, i) => (
                <DeliveryCard
                  key={d.id}
                  delivery={d}
                  selected={d.id === selectedId}
                  onClick={() => setSelectedId(d.id)}
                  index={i}
                />
              ))
            )}
          </div>
        </aside>

        {/* ── Detail panel ── */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeDelivery ? (
            <DeliveryDetailPanel delivery={activeDelivery} stream={stream} />
          ) : !isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-xs">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">No delivery selected</h3>
                <p className="text-[13px] text-slate-500 mb-5">
                  Create a new delivery or select one from the sidebar.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Delivery
                </Button>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
