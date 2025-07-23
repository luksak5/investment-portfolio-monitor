
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, TrendingUp, DollarSign, Upload, UserPlus, Settings } from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Total Clients',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total Assets',
      value: '$2.4M',
      change: '+8.2%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Advisors',
      value: '48',
      change: '+3',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Transactions',
      value: '856',
      change: '+24%',
      icon: FileText,
      color: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: 'Add New Client',
      description: 'Onboard a new portfolio client',
      icon: UserPlus,
      action: () => navigate('/admin/clients'),
      color: 'border-green-200 hover:border-green-300 hover:bg-green-50'
    },
    {
      title: 'Assign Advisor',
      description: 'Map clients to advisors',
      icon: Settings,
      action: () => navigate('/admin/advisors'),
      color: 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
    }
  ];

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your portfolio monitoring admin panel
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600">
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest system activities and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New client onboarded</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">PDF transaction uploaded</p>
                    <p className="text-xs text-muted-foreground">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Advisor assigned to client</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full p-4 h-auto flex items-start gap-3 ${action.color} transition-colors`}
                  onClick={action.action}
                >
                  <action.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-muted-foreground">{action.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
