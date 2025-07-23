
import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calendar, PieChart } from 'lucide-react';

const ClientDashboard = () => {
  const portfolioStats = [
    {
      title: 'Portfolio Value',
      value: '$125,430',
      change: '+$3,250 (2.6%)',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Monthly Return',
      value: '+2.6%',
      change: 'vs. +1.8% last month',
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'YTD Performance',
      value: '+14.2%',
      change: 'Above benchmark',
      icon: PieChart,
      color: 'text-purple-600'
    },
    {
      title: 'Last Updated',
      value: 'Today',
      change: '2:30 PM EST',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  const holdings = [
    { name: 'AAPL', shares: '50', value: '$8,750', allocation: '7.0%' },
    { name: 'MSFT', shares: '30', value: '$12,450', allocation: '9.9%' },
    { name: 'GOOGL', shares: '15', value: '$6,300', allocation: '5.0%' },
    { name: 'TSLA', shares: '25', value: '$5,500', allocation: '4.4%' },
  ];

  const recentTransactions = [
    { date: '2024-01-15', type: 'Buy', symbol: 'AAPL', amount: '$2,500' },
    { date: '2024-01-12', type: 'Sell', symbol: 'META', amount: '$1,800' },
    { date: '2024-01-10', type: 'Buy', symbol: 'MSFT', amount: '$3,200' },
  ];

  return (
    <DashboardLayout userRole="client" userName="John Client">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Portfolio</h1>
          <p className="text-muted-foreground">
            Track your investment performance and portfolio details
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portfolioStats.map((stat) => (
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
              <CardTitle>Top Holdings</CardTitle>
              <CardDescription>
                Your largest portfolio positions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {holdings.map((holding) => (
                  <div key={holding.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{holding.name}</p>
                      <p className="text-sm text-muted-foreground">{holding.shares} shares</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{holding.value}</p>
                      <p className="text-sm text-muted-foreground">{holding.allocation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest portfolio activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.symbol}</p>
                      <p className="text-sm text-muted-foreground">{transaction.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'Buy' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type}
                      </p>
                      <p className="text-sm text-muted-foreground">{transaction.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
