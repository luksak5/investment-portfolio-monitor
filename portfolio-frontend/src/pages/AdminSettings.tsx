
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Users, 
  Lock,
  AlertTriangle,
  Save
} from 'lucide-react';

const AdminSettings = () => {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    portfolioUpdates: true,
    systemMaintenance: false,
    securityAlerts: true
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5'
  });

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure system preferences and security settings
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="backup">Backup & Data</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    General Settings
                  </CardTitle>
                  <CardDescription>
                    Basic system configuration and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Company Name</Label>
                      <Input id="company-name" defaultValue="Portfolio Monitoring Inc." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">Admin Email</Label>
                      <Input id="admin-email" type="email" defaultValue="admin@company.com" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input id="timezone" defaultValue="UTC-5 (Eastern)" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Input id="currency" defaultValue="USD" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Company Address</Label>
                    <Input id="address" defaultValue="123 Financial Street, New York, NY 10001" />
                  </div>
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Save General Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure security policies and authentication settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for all admin accounts
                      </p>
                    </div>
                    <Switch 
                      checked={security.twoFactorAuth}
                      onCheckedChange={(checked) => 
                        setSecurity(prev => ({ ...prev, twoFactorAuth: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                      <Input 
                        id="session-timeout" 
                        type="number"
                        value={security.sessionTimeout}
                        onChange={(e) => 
                          setSecurity(prev => ({ ...prev, sessionTimeout: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                      <Input 
                        id="password-expiry" 
                        type="number"
                        value={security.passwordExpiry}
                        onChange={(e) => 
                          setSecurity(prev => ({ ...prev, passwordExpiry: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-attempts">Max Login Attempts</Label>
                    <Input 
                      id="login-attempts" 
                      type="number"
                      value={security.loginAttempts}
                      onChange={(e) => 
                        setSecurity(prev => ({ ...prev, loginAttempts: e.target.value }))
                      }
                      className="w-32"
                    />
                  </div>
                  <Button>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Security Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure system notifications and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications for important events
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.emailAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, emailAlerts: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Portfolio Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when portfolios are updated
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.portfolioUpdates}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, portfolioUpdates: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Maintenance</Label>
                      <p className="text-sm text-muted-foreground">
                        Notifications about system maintenance and updates
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.systemMaintenance}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, systemMaintenance: checked }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Critical security notifications and warnings
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.securityAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications(prev => ({ ...prev, securityAlerts: checked }))
                      }
                    />
                  </div>
                  <Button>
                    <Bell className="w-4 h-4 mr-2" />
                    Save Notification Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Third-Party Integrations
                  </CardTitle>
                  <CardDescription>
                    Manage external service integrations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Service</h4>
                        <p className="text-sm text-muted-foreground">SendGrid API Integration</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Market Data</h4>
                        <p className="text-sm text-muted-foreground">Alpha Vantage API</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">PDF Processing</h4>
                        <p className="text-sm text-muted-foreground">Document parsing service</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="backup">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Backup & Data Management
                  </CardTitle>
                  <CardDescription>
                    Configure automatic backups and data retention policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Daily Backup</Label>
                      <p className="text-sm text-muted-foreground">
                        Create daily backups of all portfolio data
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="retention">Data Retention Period (days)</Label>
                    <Input id="retention" type="number" defaultValue="365" className="w-32" />
                  </div>
                  <div className="space-y-4">
                    <Label>Manual Backup Actions</Label>
                    <div className="flex space-x-2">
                      <Button variant="outline">
                        <Database className="w-4 h-4 mr-2" />
                        Create Backup Now
                      </Button>
                      <Button variant="outline">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Restore from Backup
                      </Button>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Data Protection Notice</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          All backup data is encrypted and stored securely. Regular backups help protect against data loss.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
