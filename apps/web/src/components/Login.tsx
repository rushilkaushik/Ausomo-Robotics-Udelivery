import { useState } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Lock, User, Package, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

interface LoginProps {
  onShowSignUp?: () => void
}

export function Login({ onShowSignUp }: LoginProps = {}) {
  const [loginMethod, setLoginMethod] = useState<'account' | 'delivery'>('account')
  const [credentials, setCredentials] = useState({ email: '', password: '', deliveryId: '' })
  const { signIn, guestMode } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAccountLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await signIn(credentials.email, credentials.password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDeliveryLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await guestMode(credentials.deliveryId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delivery code not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-800 flex-col justify-between p-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5">
              <rect x="3" y="7" width="14" height="9" rx="2" fill="white" fillOpacity="0.9" />
              <rect x="7" y="4" width="6" height="4" rx="1" fill="white" fillOpacity="0.55" />
              <circle cx="7" cy="16" r="1.5" fill="#1d4ed8" />
              <circle cx="13" cy="16" r="1.5" fill="#1d4ed8" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm">Ausomo Robotics</span>
        </div>

        <div>
          <h1 className="text-white text-3xl font-bold leading-snug mb-4">
            Indoor Delivery,<br />Automated.
          </h1>
          <p className="text-blue-200 text-sm leading-relaxed">
            Track your robot deliveries in real time. From reception to your door — always on time.
          </p>
        </div>

        <p className="text-blue-300 text-xs">© {new Date().getFullYear()} Ausomo Robotics</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 20 20" fill="none" className="w-4 h-4">
                <rect x="3" y="7" width="14" height="9" rx="2" fill="white" fillOpacity="0.9" />
                <rect x="7" y="4" width="6" height="4" rx="1" fill="white" fillOpacity="0.55" />
                <circle cx="7" cy="16" r="1.5" fill="#1d4ed8" />
                <circle cx="13" cy="16" r="1.5" fill="#1d4ed8" />
              </svg>
            </div>
            <span className="font-semibold text-slate-800">Ausomo Robotics</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
          <p className="text-[13px] text-slate-500 mb-7">
            Use your account or delivery code to continue.
          </p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-lg px-3 py-2.5 mb-5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Tabs value={loginMethod} onValueChange={(v) => { setLoginMethod(v as 'account' | 'delivery'); setError('') }}>
            <TabsList className="w-full bg-slate-100 mb-6 p-1 rounded-lg h-auto">
              <TabsTrigger value="account" className="flex-1 text-[13px] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-1.5">
                Account Login
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex-1 text-[13px] data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-1.5">
                Track Delivery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[13px] text-slate-700">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9 bg-white border-slate-200 focus:border-blue-500"
                    value={credentials.email}
                    onChange={(e) => { setCredentials({ ...credentials, email: e.target.value }); setError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAccountLogin()}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[13px] text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 bg-white border-slate-200 focus:border-blue-500"
                    value={credentials.password}
                    onChange={(e) => { setCredentials({ ...credentials, password: e.target.value }); setError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAccountLogin()}
                  />
                </div>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                onClick={handleAccountLogin}
                disabled={loading || !credentials.email || !credentials.password}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>

              {onShowSignUp && (
                <p className="text-center text-[12px] text-slate-500 pt-2">
                  No account?{' '}
                  <button onClick={onShowSignUp} className="text-blue-600 font-medium hover:underline">
                    Create one
                  </button>
                </p>
              )}
            </TabsContent>

            <TabsContent value="delivery" className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="deliveryId" className="text-[13px] text-slate-700">Delivery Code</Label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="deliveryId"
                    type="text"
                    placeholder="e.g. jacob-a1b2c3"
                    className="pl-9 font-mono bg-white border-slate-200 focus:border-blue-500"
                    value={credentials.deliveryId}
                    onChange={(e) => { setCredentials({ ...credentials, deliveryId: e.target.value }); setError('') }}
                    onKeyDown={(e) => e.key === 'Enter' && handleDeliveryLogin()}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Found in your delivery confirmation email.
                </p>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleDeliveryLogin}
                disabled={loading || !credentials.deliveryId}
              >
                {loading ? 'Looking up…' : 'Track Package'}
              </Button>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
