import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Building, Lock, User, Package } from "lucide-react";
import { motion } from 'framer-motion';

interface LoginProps {
  onLogin: (user: { 
    id: string; 
    name: string; 
    role: 'admin' | 'user'; 
    buildingId?: string;
    deliveryIds?: string[]; // For account users with multiple deliveries
    deliveryId?: string; // For guest tracking single delivery
  }) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [loginType, setLoginType] = useState<'admin' | 'user' | null>(null);
  const [userLoginMethod, setUserLoginMethod] = useState<'account' | 'delivery'>('account');
  const [credentials, setCredentials] = useState({ username: '', password: '', deliveryId: '' });
  const [error, setError] = useState('');

  // Mock user accounts with multiple deliveries
  const mockUserAccounts = {
    'sarah': { 
      password: 'user123', 
      id: 'user-001',
      name: 'Sarah Johnson',
      deliveryIds: ['DEL-2024-001234', 'DEL-2024-001236', 'DEL-2024-001240']
    },
    'john': { 
      password: 'user123', 
      id: 'user-002',
      name: 'John Smith',
      deliveryIds: ['DEL-2024-001235', 'DEL-2024-001238']
    }
  };

  // Mock authentication - in production, this would call a backend API
  const handleAdminLogin = () => {
    // Demo credentials: admin/admin123
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      onLogin({
        id: 'admin-001',
        name: 'Building Administrator',
        role: 'admin',
        buildingId: 'building-1'
      });
    } else {
      setError('Invalid admin credentials');
    }
  };

  const handleAccountLogin = () => {
    const account = mockUserAccounts[credentials.username.toLowerCase() as keyof typeof mockUserAccounts];
    if (account && account.password === credentials.password) {
      onLogin({
        id: account.id,
        name: account.name,
        role: 'user',
        deliveryIds: account.deliveryIds
      });
    } else {
      setError('Invalid username or password');
    }
  };

  const handleDeliveryIdLogin = () => {
    // Demo: any delivery ID format DEL-XXXX-XXXXXX
    if (credentials.deliveryId.match(/^DEL-\d{4}-\d{6}$/)) {
      onLogin({
        id: 'guest-' + credentials.deliveryId,
        name: 'Guest',
        role: 'user',
        deliveryId: credentials.deliveryId
      });
    } else {
      setError('Invalid delivery ID format. Use: DEL-YYYY-XXXXXX');
    }
  };

  if (!loginType) {
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setLoginType('user')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="mb-2">Customer Portal</h3>
                  <p className="text-sm text-muted-foreground">
                    Login to your account or track a delivery with ID
                  </p>
                </div>
              </div>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setLoginType('admin')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="mb-2">Administrator Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Login to manage building robots and view all deliveries
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            <p>Demo Credentials:</p>
            <p>Admin: admin / admin123</p>
            <p>User Account: sarah / user123</p>
            <p>Guest: DEL-2024-001234</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="p-6">
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLoginType(null);
                setError('');
                setCredentials({ username: '', password: '', deliveryId: '' });
              }}
              className="mb-4"
            >
              ← Back
            </Button>
            <div className="flex items-center gap-3 mb-2">
              {loginType === 'admin' ? (
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <h2>
                {loginType === 'admin' ? 'Administrator Login' : 'Customer Portal'}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {loginType === 'admin' 
                ? 'Enter your admin credentials to access the dashboard' 
                : 'Login to your account or track with a delivery ID'}
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            {loginType === 'admin' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter username"
                      className="pl-10"
                      value={credentials.username}
                      onChange={(e) => {
                        setCredentials({ ...credentials, username: e.target.value });
                        setError('');
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
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
                      placeholder="Enter password"
                      className="pl-10"
                      value={credentials.password}
                      onChange={(e) => {
                        setCredentials({ ...credentials, password: e.target.value });
                        setError('');
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleAdminLogin}
                  disabled={!credentials.username || !credentials.password}
                >
                  Login as Administrator
                </Button>
              </>
            ) : (
              <Tabs value={userLoginMethod} onValueChange={(v: string) => setUserLoginMethod(v as 'account' | 'delivery')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="account">My Account</TabsTrigger>
                  <TabsTrigger value="delivery">Delivery ID</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="account-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="account-username"
                        type="text"
                        placeholder="Enter username"
                        className="pl-10"
                        value={credentials.username}
                        onChange={(e) => {
                          setCredentials({ ...credentials, username: e.target.value });
                          setError('');
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleAccountLogin()}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="account-password"
                        type="password"
                        placeholder="Enter password"
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
                    disabled={!credentials.username || !credentials.password}
                  >
                    Login to Account
                  </Button>
                </TabsContent>
                <TabsContent value="delivery" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="deliveryId">Delivery ID</Label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="deliveryId"
                        type="text"
                        placeholder="DEL-2024-001234"
                        className="pl-10 font-mono"
                        value={credentials.deliveryId}
                        onChange={(e) => {
                          setCredentials({ ...credentials, deliveryId: e.target.value.toUpperCase() });
                          setError('');
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && handleDeliveryIdLogin()}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Find this ID in your delivery confirmation email
                    </p>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleDeliveryIdLogin}
                    disabled={!credentials.deliveryId}
                  >
                    Track My Package
                  </Button>
                </TabsContent>
              </Tabs>
            )}
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-center text-muted-foreground">
              {loginType === 'admin' 
                ? 'Demo: Use admin / admin123' 
                : userLoginMethod === 'account'
                  ? 'Demo: sarah / user123 or john / user123'
                  : 'Demo: DEL-2024-001234 or DEL-2024-001235'}
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
