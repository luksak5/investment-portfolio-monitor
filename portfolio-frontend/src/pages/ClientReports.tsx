import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Percent, BarChart3, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

const ClientReports = () => {
  // Sample data
  const mockHoldings = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 150,
      avgPrice: 175.50,
      currentPrice: 180.25,
      marketValue: 27037.50,
      gainLoss: 712.50,
      percentage: 4.05,
      currency: 'USD',
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      quantity: 100,
      avgPrice: 340.00,
      currentPrice: 355.20,
      marketValue: 35520.00,
      gainLoss: 1520.00,
      percentage: 4.47,
      currency: 'USD',
    },
    {
      symbol: 'RELIANCE.NS',
      name: 'Reliance Industries',
      quantity: 50,
      avgPrice: 2450.75,
      currentPrice: 2567.30,
      marketValue: 128365.00,
      gainLoss: 5827.50,
      percentage: 4.75,
      currency: 'INR',
    },
  ];

  const performanceData = [
    { month: 'Jan', value: 95000 },
    { month: 'Feb', value: 96500 },
    { month: 'Mar', value: 98200 },
    { month: 'Apr', value: 97800 },
    { month: 'May', value: 99500 },
    { month: 'Jun', value: 102736 },
  ];

  const allocationData = [
    { name: 'Equity', value: 60, color: '#3b82f6' },
    { name: 'Bonds', value: 25, color: '#10b981' },
    { name: 'Cash', value: 10, color: '#f59e0b' },
    { name: 'Alternatives', value: 5, color: '#8b5cf6' },
  ];

  const dividends = [
    { date: '2024-06-15', symbol: 'AAPL', amount: 24.75, currency: 'USD' },
    { date: '2024-06-10', symbol: 'MSFT', amount: 31.00, currency: 'USD' },
    { date: '2024-05-20', symbol: 'RELIANCE.NS', amount: 850.00, currency: 'INR' },
  ];

  const [currencyDisplayMode, setCurrencyDisplayMode] = useState('base');
  const [baseCurrency, setBaseCurrency] = useState('USD');

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CAD', 'AUD', 'CHF'];

  const portfolioSummaryStats = [
    {
      title: 'Initial Investment',
      value: (96500).toLocaleString(),
      currency: baseCurrency,
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      title: 'Current Value',
      value: (102736.25).toLocaleString(),
      currency: baseCurrency,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Total Gains',
      value: `+${(6236.25).toLocaleString()}`,
      currency: baseCurrency,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Dividends Received',
      value: `+${(250.00).toLocaleString()}`,
      currency: baseCurrency,
      icon: Percent,
      color: 'text-green-600'
    },
    {
      title: 'Management Fees',
      value: (245.00).toLocaleString(),
      currency: baseCurrency,
      icon: TrendingDown,
      color: 'text-blue-600'
    },
    {
      title: 'Net Gains',
      value: `+${(6731.25).toLocaleString()}`,
      currency: baseCurrency,
      icon: Activity,
      color: 'text-green-600'
    }
  ];

  return (
    <DashboardLayout userRole="client" userName="John Client">
      <div className="space-y-6">
        {/* Currency Settings (no search bar for client) */}
        <div className="flex justify-end items-center space-x-2">
          <span className="text-sm font-medium">Currency Settings:</span>
          <Select value={currencyDisplayMode} onValueChange={setCurrencyDisplayMode}>
            <SelectTrigger className="w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base">Base Currency (USD) - Convert all to USD</SelectItem>
              <SelectItem value="native">Native Currency - Show in original instrument currency</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Portfolio Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {portfolioSummaryStats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value} {stat.currency}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Holdings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Current Holdings</span>
            </CardTitle>
            <CardDescription>Detailed breakdown of portfolio positions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>Current Price</TableHead>
                  <TableHead>Market Value</TableHead>
                  <TableHead>Gain/Loss</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHoldings.map((holding) => (
                  <TableRow key={holding.symbol}>
                    <TableCell className="font-medium">{holding.symbol}</TableCell>
                    <TableCell>{holding.name}</TableCell>
                    <TableCell>{holding.quantity}</TableCell>
                    <TableCell>{holding.avgPrice.toFixed(2)}</TableCell>
                    <TableCell>{holding.currentPrice.toFixed(2)}</TableCell>
                    <TableCell>{holding.marketValue.toLocaleString()}</TableCell>
                    <TableCell className={holding.gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
                      {holding.gainLoss >= 0 ? '+' : ''}{holding.gainLoss.toFixed(2)}
                    </TableCell>
                    <TableCell className={holding.percentage >= 0 ? "text-green-600" : "text-red-600"}>
                      {holding.percentage >= 0 ? '+' : ''}{holding.percentage.toFixed(2)}%
                    </TableCell>
                    <TableCell>{holding.currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
              <CardDescription>Portfolio value over time (in {baseCurrency})</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
              <CardDescription>Current asset allocation based on market values (in {baseCurrency})</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {allocationData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dividends Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Dividends</CardTitle>
            <CardDescription>Dividend payments received in the last quarter</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Currency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dividends.map((dividend, index) => (
                  <TableRow key={index}>
                    <TableCell>{dividend.date}</TableCell>
                    <TableCell>{dividend.symbol}</TableCell>
                    <TableCell className="text-green-600">{dividend.currency} {dividend.amount.toFixed(2)}</TableCell>
                    <TableCell>{dividend.currency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ClientReports;