
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, DollarSign, Activity } from 'lucide-react';

const AdvisorDashboard = () => {
  const stats = [
    {
      title: 'My Clients',
      value: '24',
      change: '+2 this month',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Assets Under Management',
      value: '$850K',
      change: '+5.4% this quarter',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Portfolio Performance',
      value: '+12.3%',
      change: 'YTD Average',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Active Portfolios',
      value: '18',
      change: '6 need review',
      icon: Activity,
      color: 'text-orange-600'
    }
  ];

  const recentClients = [
    { name: 'John Smith', portfolio: '$45,000', change: '+2.1%' },
    { name: 'Sarah Johnson', portfolio: '$62,000', change: '+1.8%' },
    { name: 'Mike Davis', portfolio: '$38,000', change: '-0.5%' },
    { name: 'Emily Brown', portfolio: '$71,000', change: '+3.2%' },
  ];

  return (
    <DashboardLayout userRole="advisor" userName="Jane Advisor">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Advisor Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage your client portfolios
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
                <p className="text-xs text-muted-foreground">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Portfolios</CardTitle>
              <CardDescription>
                Recent portfolio performance overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentClients.map((client) => (
                  <div key={client.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.portfolio}</p>
                    </div>
                    <div className={`text-sm font-medium ${
                      client.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {client.change}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Action Items</CardTitle>
              <CardDescription>
                Tasks requiring your attention
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="font-medium text-yellow-800">Portfolio Rebalancing</div>
                <div className="text-sm text-yellow-600">3 clients need portfolio review</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-blue-800">Client Meetings</div>
                <div className="text-sm text-blue-600">2 meetings scheduled this week</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">Reports Due</div>
                <div className="text-sm text-green-600">Monthly reports ready for review</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdvisorDashboard;
