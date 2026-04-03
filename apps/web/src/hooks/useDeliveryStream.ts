/**
 * useDeliveryStream — WebSocket hook that streams robot position and
 * delivery status updates from the gateway for a given delivery.
 *
 * Protocol (gateway → client):
 *   { type: 'position', x: number, y: number, theta?: number }
 *   { type: 'status',   status: string }
 *
 * On connect the client sends:
 *   { type: 'watch', delivery_id: string }
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { getGatewayWsUrl, isGatewayConfigured } from '../lib/gateway'

export interface RobotPosition {
  x: number
  y: number
  /** Heading in radians, 0 = East, counter-clockwise positive */
  theta: number
}

export type StreamStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error'

export interface DeliveryStreamState {
  /** Latest robot position from the gateway, null until first update */
  position: RobotPosition | null
  /** Recent position history for path trail (last 50 points) */
  positionHistory: RobotPosition[]
  /** Delivery status string pushed by the gateway (mirrors Supabase status) */
  liveStatus: string | null
  /** WebSocket connection state */
  streamStatus: StreamStatus
  /** Human-readable error, set when streamStatus === 'error' */
  error: string | null
}

const MAX_HISTORY = 50
const RECONNECT_DELAY_MS = 3_000

export function useDeliveryStream(deliveryId: string | null): DeliveryStreamState {
  const [position, setPosition]             = useState<RobotPosition | null>(null)
  const [positionHistory, setPositionHistory] = useState<RobotPosition[]>([])
  const [liveStatus, setLiveStatus]         = useState<string | null>(null)
  const [streamStatus, setStreamStatus]     = useState<StreamStatus>('idle')
  const [error, setError]                   = useState<string | null>(null)

  const wsRef            = useRef<WebSocket | null>(null)
  const reconnectRef     = useRef<ReturnType<typeof setTimeout>>()
  const deliveryIdRef    = useRef(deliveryId)
  const unmountedRef     = useRef(false)

  // Keep ref in sync so the reconnect closure sees the latest deliveryId
  deliveryIdRef.current = deliveryId

  const connect = useCallback(() => {
    if (unmountedRef.current) return
    if (!deliveryIdRef.current) return
    if (!isGatewayConfigured()) {
      setStreamStatus('error')
      setError('Gateway not configured — set VITE_GATEWAY_URL')
      return
    }

    const url = getGatewayWsUrl()
    if (!url) {
      setStreamStatus('error')
      setError('No WebSocket URL available')
      return
    }

    // Close any existing connection
    wsRef.current?.close()

    setStreamStatus('connecting')
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (unmountedRef.current) { ws.close(); return }
      setStreamStatus('connected')
      setError(null)
      // Tell the gateway which delivery to watch
      ws.send(JSON.stringify({ type: 'watch', delivery_id: deliveryIdRef.current }))
    }

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string)

        if (msg.type === 'position') {
          const pos: RobotPosition = {
            x:     Number(msg.x),
            y:     Number(msg.y),
            theta: Number(msg.theta ?? 0),
          }
          setPosition(pos)
          setPositionHistory((prev) => {
            const next = [...prev, pos]
            return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next
          })
        }

        if (msg.type === 'status') {
          setLiveStatus(String(msg.status))
        }
      } catch {
        // Ignore malformed messages
      }
    }

    ws.onerror = () => {
      if (!unmountedRef.current) setStreamStatus('error')
    }

    ws.onclose = () => {
      if (unmountedRef.current) return
      setStreamStatus('reconnecting')
      reconnectRef.current = setTimeout(connect, RECONNECT_DELAY_MS)
    }
  }, []) // stable — reads deliveryId via ref

  useEffect(() => {
    unmountedRef.current = false

    if (deliveryId) {
      // Reset history when switching to a different delivery
      setPosition(null)
      setPositionHistory([])
      setLiveStatus(null)
      connect()
    } else {
      setStreamStatus('idle')
    }

    return () => {
      unmountedRef.current = true
      clearTimeout(reconnectRef.current)
      wsRef.current?.close()
    }
  }, [deliveryId, connect])

  return { position, positionHistory, liveStatus, streamStatus, error }
}
