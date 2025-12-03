import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { createDelivery, getAnchorPointsForFloor } from '../lib/auth'
import { supabase } from '../lib/supabaseClient'
import { AnchorPoint, FloorMap } from '../lib/types'

interface DeliveryFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function DeliveryForm({ onSuccess, onCancel }: DeliveryFormProps) {
  const { user, signOut } = useAuth()
  const [floors, setFloors] = useState<FloorMap[]>([])
  const [anchorPoints, setAnchorPoints] = useState<AnchorPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    floorMapId: '',
    pickupPointId: '',
    dropoffPointId: ''
  })

  // Fetch floors for the user's building
  useEffect(() => {
    async function fetchFloors() {
      if (!user?.building_id) {
        console.log('No building_id for user:', user)
        return
      }
      const user_building_id = user.building_id

      console.log('Fetching floors for building:', user_building_id)

      const { data, error } = await supabase
        .from('floor_maps')
        .select('*')
        .eq('building_id', user_building_id)
        .order('floor_number')

      if (error) {
        console.error('Error fetching floors:', error)
        setError('Failed to load floors: ' + error.message)
        return
      }

      console.log('Fetched floors:', data)
      setFloors(data || [])
    }

    fetchFloors()
  }, [user])

  // Fetch anchor points when floor is selected
  useEffect(() => {
    async function fetchAnchorPoints() {
      if (!formData.floorMapId) {
        setAnchorPoints([])
        return
      }

      try {
        const points = await getAnchorPointsForFloor(formData.floorMapId)
        setAnchorPoints(points || [])
      } catch (err) {
        setError('Failed to load delivery points')
      }
    }

    fetchAnchorPoints()
  }, [formData.floorMapId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!user) {
      setError('You must be logged in to create a delivery')
      setLoading(false)
      return
    }

    if (!formData.floorMapId || !formData.pickupPointId || !formData.dropoffPointId) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (formData.pickupPointId === formData.dropoffPointId) {
      setError('Pickup and dropoff locations must be different')
      setLoading(false)
      return
    }

    try {
      await createDelivery(
        user.id,
        user.building_id!,
        formData.floorMapId,
        formData.pickupPointId,
        formData.dropoffPointId,
        user.full_name
      )

      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create delivery')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await signOut()
    } catch (err) {
      setError('Failed to logout')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Create New Delivery</h2>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-700 underline"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Floor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Floor
          </label>
          <select
            value={formData.floorMapId}
            onChange={(e) => setFormData({
              ...formData,
              floorMapId: e.target.value,
              pickupPointId: '',
              dropoffPointId: ''
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose a floor</option>
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.floor_name || `Floor ${floor.floor_number}`}
              </option>
            ))}
          </select>
        </div>

        {/* Pickup Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pickup Location
          </label>
          <select
            value={formData.pickupPointId}
            onChange={(e) => setFormData({...formData, pickupPointId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!formData.floorMapId}
          >
            <option value="">Choose pickup location</option>
            {anchorPoints.map((point) => (
              <option key={point.id} value={point.id}>
                {point.name} ({point.type})
              </option>
            ))}
          </select>
        </div>

        {/* Dropoff Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dropoff Location
          </label>
          <select
            value={formData.dropoffPointId}
            onChange={(e) => setFormData({...formData, dropoffPointId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={!formData.floorMapId}
          >
            <option value="">Choose dropoff location</option>
            {anchorPoints.map((point) => (
              <option key={point.id} value={point.id}>
                {point.name} ({point.type})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Delivery'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </motion.div>
  )
}
