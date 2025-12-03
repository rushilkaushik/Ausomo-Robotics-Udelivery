import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Building, Lock, User, Package } from "lucide-react";
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext'

interface LoginProps {
  onShowSignUp?: () => void;
}

export function Login({ onShowSignUp }: LoginProps = {}) {
  const [loginMethod, setLoginMethod] = useState<'account' | 'delivery'>('account');
  const [credentials, setCredentials] = useState({ email: '', password: '', deliveryId: '' });
  const { signIn, guestMode } = useAuth()
  const [error, setError] = useState("")

  async function handleAccountLogin() {
    try {
      await signIn(credentials.email, credentials.password)
    } catch (err) {
      console.log(err)
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  };

  async function handleDeliveryIdLogin() {
    try {
      await guestMode(credentials.deliveryId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login Failed')
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <Building className="h-8 w-8 text-white" />
          </div>
          <h1 className="mb-2">RoboDeliver</h1>
          <p className="text-muted-foreground">Indoor Delivery Robot Tracking</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6">
            {error && (
              <Alert variant="destructive" className="mb-4">
                {error}
              </Alert>
            )}

            <Tabs value={loginMethod} onValueChange={(v: string) => setLoginMethod(v as 'account' | 'delivery')}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="account">Account Login</TabsTrigger>
                <TabsTrigger value="delivery">Track Delivery</TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={credentials.email}
                      onChange={(e) => {
                        setCredentials({ ...credentials, email: e.target.value });
                        setError('');
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleAccountLogin()}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      value={credentials.password}
                      onChange={(e) => {
                        setCredentials({ ...credentials, password: e.target.value });
                        setError('');
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleAccountLogin()}
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={handleAccountLogin}
                  disabled={!credentials.email || !credentials.password}
                >
                  Login
                </Button>

                {onShowSignUp && (
                  <p className="text-xs text-center text-muted-foreground pt-4">
                    Don't have an account?{' '}
                    <button
                      onClick={onShowSignUp}
                      className="text-blue-600 hover:underline"
                    >
                      Sign up here
                    </button>
                  </p>
                )}
              </TabsContent>

              <TabsContent value="delivery" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryId">Delivery Code</Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="deliveryId"
                      type="text"
                      placeholder="e.g., jacob-a1b2c3d4"
                      className="pl-10 font-mono"
                      value={credentials.deliveryId}
                      onChange={(e) => {
                        setCredentials({ ...credentials, deliveryId: e.target.value });
                        setError('');
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleDeliveryIdLogin()}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Find this code in your delivery confirmation
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={handleDeliveryIdLogin}
                  disabled={!credentials.deliveryId}
                >
                  Track Package
                </Button>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
