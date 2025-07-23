
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock, BarChart3 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Mock user database - replace with actual authentication
  const mockUsers = {
    'admin@portfolio.com': { role: 'admin', name: 'Admin User' },
    'advisor@portfolio.com': { role: 'advisor', name: 'Jane Advisor' },
    'client@portfolio.com': { role: 'client', name: 'John Client' }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication - replace with actual Supabase auth
    setTimeout(() => {
      setIsLoading(false);
      
      // Check user credentials and get role
      const user = mockUsers[email as keyof typeof mockUsers];
      
      if (user) {
        // Route based on user role
        switch (user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'advisor':
            navigate('/advisor');
            break;
          case 'client':
            navigate('/client');
            break;
          default:
            alert('Invalid user role');
        }
      } else {
        alert('Invalid credentials');
      }
    }, 1000);
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false);
      alert('OTP sent to your email address');
    }, 1000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate password reset
    setTimeout(() => {
      setIsLoading(false);
      alert('Password reset email sent');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-4 rounded-full">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Portfolio Monitoring System
          </CardTitle>
          <CardDescription>
            Sign in to access your portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="otp">OTP</TabsTrigger>
              <TabsTrigger value="forgot">Forgot</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium mb-2">Demo Credentials:</p>
                <div className="space-y-1 text-gray-600">
                  <p>Admin: admin@portfolio.com</p>
                  <p>Advisor: advisor@portfolio.com</p>
                  <p>Client: client@portfolio.com</p>
                  <p className="text-xs mt-2">Password: any password</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="otp" className="space-y-4">
              <form onSubmit={handleOTPLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otpEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="otpEmail"
                      type="email"
                      placeholder="Enter your email for OTP"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="forgot" className="space-y-4">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="forgotEmail"
                      type="email"
                      placeholder="Enter your email for password reset"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending Reset Email...' : 'Reset Password'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Need help? Contact your administrator</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
