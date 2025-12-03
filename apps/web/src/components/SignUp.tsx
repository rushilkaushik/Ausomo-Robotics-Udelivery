import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert } from "./ui/alert";
import { Building, Lock, User, Mail } from "lucide-react";
import { motion } from 'framer-motion';
import { signUpNewUser } from '../lib/auth';
import { supabase } from "../lib/supabaseClient";

interface SignUpProps {
  onBackToLogin: () => void;
}


async function castNametoId(buildingName:string): Promise<string>{
  const {data: buildingId, error: err} = await supabase.from('buildings').select('id').eq('name', buildingName).single()

  if (err) throw err
  return buildingId.id
}
export function SignUp({ onBackToLogin }: SignUpProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    buildingId: ''
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSignUp() {
    // Validation
    if (!formData.email || !formData.password || !formData.fullName) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    const id = await castNametoId(formData.buildingId)
    try {
      // Call signUpNewUser from auth.ts - creates auth user AND profile record
      await signUpNewUser(
        formData.email,
        formData.password,
        {
          full_name: formData.fullName,
          role: 'user',
          building_id: id
        }
      );
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2">Account Created!</h2>
            <p className="text-muted-foreground mb-4">
              Your account has been successfully created. Redirecting to login...
            </p>
          </Card>
        </motion.div>
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
              onClick={onBackToLogin}
              className="mb-4"
            >
              ← Back to Login
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <h2>Create Account</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Sign up to track your deliveries and manage orders
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    setError('');
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setError('');
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min 6 characters"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setError('');
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  className="pl-10"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="buildingId">Building ID (Optional)</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="buildingId"
                  type="text"
                  placeholder="Leave empty if unknown"
                  className="pl-10"
                  value={formData.buildingId}
                  onChange={(e) => {
                    setFormData({ ...formData, buildingId: e.target.value });
                    setError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your building ID can be found on your welcome email
              </p>
            </div>

            <Button
              className="w-full"
              onClick={handleSignUp}
              disabled={loading || !formData.email || !formData.password || !formData.fullName}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{' '}
              <button
                onClick={onBackToLogin}
                className="text-blue-600 hover:underline"
              >
                Login here
              </button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
