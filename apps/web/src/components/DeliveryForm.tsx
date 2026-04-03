import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import {
  createDelivery,
  fetchAnchorPointsForFloor,
  fetchFloorsForBuilding,
} from '../lib/queries'
import { isGatewayConfigured, createDeliveryViaGateway } from '../lib/gateway'
import { supabase } from '../lib/supabaseClient'
import { AnchorPoint, FloorMap } from '../lib/types'
import { AlertCircle, Zap } from 'lucide-react'

interface DeliveryFormProps {
  /** Called on success with the new delivery's UUID */
  onSuccess?: (deliveryId: string) => void
  onCancel?: () => void
}

export function DeliveryForm({ onSuccess, onCancel }: DeliveryFormProps) {
  const { user } = useAuth()
  const [floors, setFloors]             = useState<FloorMap[]>([])
  const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const [formData, setFormData] = useState({
    floorMapId:     '',
    pickupPointId:  '',
    dropoffPointId: '',
  })

  // ── Load floors for the user's building ──────────────────────────────────
  useEffect(() => {
    if (!user?.building_id) return
    fetchFloorsForBuilding(user.building_id)
      .then(setFloors)
      .catch(() => setError('Failed to load floors'))
  }, [user])

  // ── Load anchor points when floor changes ─────────────────────────────────
  useEffect(() => {
    if (!formData.floorMapId) { setAnchorPoints([]); return }
    fetchAnchorPointsForFloor(formData.floorMapId)
      .then(setAnchorPoints)
      .catch(() => setError('Failed to load delivery points'))
  }, [formData.floorMapId])

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!user) { setError('You must be logged in'); return }

    if (!formData.floorMapId || !formData.pickupPointId || !formData.dropoffPointId) {
      setError('Please fill in all fields')
      return
    }

    if (formData.pickupPointId === formData.dropoffPointId) {
      setError('Pickup and dropoff must be different')
      return
    }

    setLoading(true)
    try {
      let deliveryId: string

      if (isGatewayConfigured()) {
        // ── Gateway path: sends goal to robot, creates Supabase record ──────
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) throw new Error('No active session — please log in again')

        const result = await createDeliveryViaGateway({
          floor_map_id:            formData.floorMapId,
          pickup_anchor_point_id:  formData.pickupPointId,
          dropoff_anchor_point_id: formData.dropoffPointId,
          token:                   session.access_token,
        })
        deliveryId = result.delivery_id
      } else {
        // ── Direct Supabase path: no robot goal (dev / no gateway) ──────────
        const delivery = await createDelivery({
          userId:               user.id,
          buildingId:           user.building_id!,
          floorMapId:           formData.floorMapId,
          pickupAnchorPointId:  formData.pickupPointId,
          dropoffAnchorPointId: formData.dropoffPointId,
          userName:             user.full_name,
        })
        deliveryId = delivery.id
      }

      onSuccess?.(deliveryId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create delivery')
    } finally {
      setLoading(false)
    }
  }

  const gatewayMode = isGatewayConfigured()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 w-full max-w-md"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">Create New Delivery</h2>
        <p className="text-[13px] text-slate-500 mt-0.5">
          Select a floor and pickup / dropoff locations.
        </p>
        {gatewayMode && (
          <div className="flex items-center gap-1.5 mt-2 text-[12px] text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1.5">
            <Zap className="h-3 w-3" />
            Gateway connected — robot will be dispatched automatically
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg px-3 py-2.5 mb-4">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Floor */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
            Floor
          </label>
          <select
            value={formData.floorMapId}
            onChange={(e) =>
              setFormData({ floorMapId: e.target.value, pickupPointId: '', dropoffPointId: '' })
            }
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a floor…</option>
            {floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.floor_name ?? `Floor ${f.floor_number}`}
              </option>
            ))}
          </select>
        </div>

        {/* Pickup */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
            Pickup Location
          </label>
          <select
            value={formData.pickupPointId}
            onChange={(e) => setFormData({ ...formData, pickupPointId: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
            required
            disabled={!formData.floorMapId}
          >
            <option value="">Select pickup…</option>
            {anchorPoints.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropoff */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
            Dropoff Location
          </label>
          <select
            value={formData.dropoffPointId}
            onChange={(e) => setFormData({ ...formData, dropoffPointId: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
            required
            disabled={!formData.floorMapId}
          >
            <option value="">Select dropoff…</option>
            {anchorPoints.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Creating…' : gatewayMode ? 'Dispatch Robot' : 'Create Delivery'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </motion.div>
  )
}
