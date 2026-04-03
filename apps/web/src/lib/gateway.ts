/**
 * gateway.ts — HTTP + WebSocket client for the delivery gateway server.
 *
 * Set VITE_GATEWAY_URL in .env to enable gateway mode.
 * If not set the app falls back to direct Supabase writes (no robot goal sent).
 *
 * Example .env:
 *   VITE_GATEWAY_URL=http://localhost:3001
 */

const GATEWAY_HTTP = import.meta.env.VITE_GATEWAY_URL as string | undefined
const GATEWAY_WS   = import.meta.env.VITE_GATEWAY_WS_URL as string | undefined

/** True when the gateway URL is configured in the environment. */
export function isGatewayConfigured(): boolean {
  return Boolean(GATEWAY_HTTP)
}

/** Derive WebSocket URL from the HTTP URL if not explicitly set. */
export function getGatewayWsUrl(): string {
  if (GATEWAY_WS) return GATEWAY_WS
  if (GATEWAY_HTTP) return GATEWAY_HTTP.replace(/^http/, 'ws')
  return ''
}

// ---------------------------------------------------------------------------
// POST /deliveries
// ---------------------------------------------------------------------------

export interface GatewayDeliveryRequest {
  floor_map_id: string
  pickup_anchor_point_id: string
  dropoff_anchor_point_id: string
  /** Supabase JWT – required for gateway auth */
  token: string
}

export interface GatewayDeliveryResponse {
  delivery_id: string
}

/**
 * Create a delivery via the gateway.
 * The gateway validates the JWT, creates the Supabase record,
 * and sends the navigation goal to the robot.
 */
export async function createDeliveryViaGateway(
  params: GatewayDeliveryRequest
): Promise<GatewayDeliveryResponse> {
  if (!GATEWAY_HTTP) throw new Error('Gateway URL not configured')

  const { token, ...body } = params

  const res = await fetch(`${GATEWAY_HTTP}/deliveries`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`Gateway error ${res.status}: ${text}`)
  }

  return res.json()
}
