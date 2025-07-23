import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Search, Calendar, PieChart as PieChartIcon, TrendingUp, DollarSign, FileText, BarChart3, Download, Settings } from 'lucide-react';

// Sample client data
const clients = [
  { id: 'ACC001', name: 'John Anderson', accountId: 'ACC001' },
  { id: 'ACC002', name: 'Sarah Johnson', accountId: 'ACC002' },
  { id: 'ACC003', name: 'Michael Brown', accountId: 'ACC003' },
  { id: 'ACC004', name: 'Emma Wilson', accountId: 'ACC004' },
  { id: 'ACC005', name: 'Robert Davis', accountId: 'ACC005' },
];

// Sample portfolio data
const portfolioData = {
  ACC001: {
    portfolioSummary: [
      {
        instrumentName: 'Apple Inc.',
        assetClass: 'Equity',
        position: 100,
        currentPrice: 175.25,
        currentValue: 17525,
        avgPurchasePrice: 165.00,
        costBasis: 16500.00,
        currency: 'USD',
        dailyPL: 125.50,
        unrealizedPL: 1025.00,
        realizedPL: 0,
        dividendPayout: 44.00,
        absoluteReturn: 6.21,
        xirr: 8.5
      },
      {
        instrumentName: 'Microsoft Corp.',
        assetClass: 'Equity',
        position: 50,
        currentPrice: 378.85,
        currentValue: 18942.50,
        avgPurchasePrice: 350.00,
        costBasis: 17500.00,
        currency: 'USD',
        dailyPL: -89.25,
        unrealizedPL: 1442.50,
        realizedPL: 250.00,
        dividendPayout: 33.00,
        absoluteReturn: 8.24,
        xirr: 12.3
      },
      {
        instrumentName: 'Reliance Industries',
        assetClass: 'Equity',
        position: 25,
        currentPrice: 2650.75,
        currentValue: 66268.75,
        avgPurchasePrice: 2500.00,
        costBasis: 62500.00,
        currency: 'INR',
        dailyPL: 376.25,
        unrealizedPL: 3768.75,
        realizedPL: 0,
        dividendPayout: 168.00,
        absoluteReturn: 6.03,
        xirr: 9.8
      }
    ],
    purchaseAllocation: [
      { name: 'Equity', value: 70, amount: 350000 },
      { name: 'Debt', value: 20, amount: 100000 },
      { name: 'Gold', value: 5, amount: 25000 },
      { name: 'REITs', value: 3, amount: 15000 },
      { name: 'Others', value: 2, amount: 10000 }
    ],
    currentAllocation: [
      { name: 'Equity', value: 75, amount: 387500 },
      { name: 'Debt', value: 18, amount: 93000 },
      { name: 'Gold', value: 4, amount: 20700 },
      { name: 'REITs', value: 2, amount: 10350 },
      { name: 'Others', value: 1, amount: 5175 }
    ],
    transactions: [
      {
        instrumentName: 'Apple Inc.',
        assetClass: 'Equity',
        ticker: 'AAPL',
        transactionType: 'Buy',
        date: '2024-01-15',
        price: 165.00,
        currentPrice: 175.25,
        holdingDays: 180
      },
      {
        instrumentName: 'Microsoft Corp.',
        assetClass: 'Equity',
        ticker: 'MSFT',
        transactionType: 'Buy',
        date: '2024-02-10',
        price: 350.00,
        currentPrice: 378.85,
        holdingDays: 154
      }
    ],
    aumData: [
      { date: '2024-01', aum: 480000 },
      { date: '2024-02', aum: 492000 },
      { date: '2024-03', aum: 505000 },
      { date: '2024-04', aum: 498000 },
      { date: '2024-05', aum: 512000 },
      { date: '2024-06', aum: 516725 }
    ],
    dividends: [
      {
        instrumentName: 'Apple Inc.',
        dividendDate: '2024-05-16',
        amount: 44.00,
        currency: 'USD',
        type: 'Quarterly'
      },
      {
        instrumentName: 'Microsoft Corp.',
        dividendDate: '2024-06-15',
        amount: 33.00,
        currency: 'USD',
        type: 'Quarterly'
      }
    ]
  }
};

const COLORS = ['#2563eb', '#16a34a', '#eab308', '#dc2626', '#9333ea'];

const AdminReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [currencyDisplayMode, setCurrencyDisplayMode] = useState('base');
  const [baseCurrency, setBaseCurrency] = useState('USD');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.accountId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientSelect = (clientId: string) => {
    setSelectedClient(clientId);
  };

  const selectedClientData = selectedClient ? portfolioData[selectedClient as keyof typeof portfolioData] : null;

  const chartConfig = {
    aum: { label: "AUM", color: "#2563eb" }
  };

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        {/* Client Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Client Search
            </CardTitle>
            <CardDescription>
              Search by client name or account ID to view portfolio details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Search client name or account ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                
                {/* Search Results Dropdown */}
                {searchTerm && filteredClients.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="p-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0 transition-colors"
                        onClick={() => {
                          handleClientSelect(client.id);
                          setSearchTerm('');
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-foreground">{client.name}</div>
                            <div className="text-sm text-muted-foreground">Account ID: {client.accountId}</div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Select
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedClient && (
                <div className="flex gap-4 items-center p-4 bg-muted rounded-lg">
                  <Settings className="h-5 w-5" />
                  <span className="font-medium">Currency Settings:</span>
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
              )}
            </div>
          </CardContent>
        </Card>

        {/* Client Portfolio Reports */}
        {selectedClient && selectedClientData && (
          <div className="space-y-6">
            {/* Overall Portfolio Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Overall Portfolio Summary
                </CardTitle>
                <CardDescription>
                  Complete portfolio overview for {clients.find(c => c.id === selectedClient)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Purchase Value</div>
                    <div className="text-2xl font-bold">{(96500).toLocaleString()} {baseCurrency}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Current Value</div>
                    <div className="text-2xl font-bold">{(102736.25).toLocaleString()} {baseCurrency}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Unrealized Gain/Loss</div>
                    <div className="text-2xl font-bold text-green-600">+{(6236.25).toLocaleString()} {baseCurrency}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Realized Gain/Loss</div>
                    <div className="text-2xl font-bold text-green-600">+{(250.00).toLocaleString()} {baseCurrency}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Dividend Payout</div>
                    <div className="text-2xl font-bold text-blue-600">{(245.00).toLocaleString()} {baseCurrency}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Overall Portfolio Gain/Loss</div>
                    <div className="text-2xl font-bold text-green-600">+{(6731.25).toLocaleString()} {baseCurrency}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">XIRR</div>
                    <div className="text-2xl font-bold text-purple-600">10.2%</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Absolute Return</div>
                    <div className="text-2xl font-bold text-purple-600">6.97%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Portfolio Summary
                </CardTitle>
                <CardDescription>
                  Detailed holdings and performance for {clients.find(c => c.id === selectedClient)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Instrument Name</TableHead>
                        <TableHead>Asset Class</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>Current Value</TableHead>
                        <TableHead>Avg Purchase Price</TableHead>
                        <TableHead>Cost Basis</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Daily P&L</TableHead>
                        <TableHead>Unrealized P&L</TableHead>
                        <TableHead>Realized P&L</TableHead>
                        <TableHead>Dividend Payout</TableHead>
                        <TableHead>Absolute Return %</TableHead>
                        <TableHead>XIRR %</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClientData.portfolioSummary.map((holding, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{holding.instrumentName}</TableCell>
                          <TableCell>{holding.assetClass}</TableCell>
                          <TableCell>{holding.position}</TableCell>
                          <TableCell>{holding.currentPrice.toFixed(2)}</TableCell>
                          <TableCell>{holding.currentValue.toLocaleString()}</TableCell>
                          <TableCell>{holding.avgPurchasePrice.toFixed(2)}</TableCell>
                          <TableCell>{holding.costBasis.toLocaleString()}</TableCell>
                          <TableCell>{holding.currency}</TableCell>
                          <TableCell className={holding.dailyPL >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {holding.dailyPL.toFixed(2)}
                          </TableCell>
                          <TableCell className={holding.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {holding.unrealizedPL.toFixed(2)}
                          </TableCell>
                          <TableCell className={holding.realizedPL >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {holding.realizedPL.toFixed(2)}
                          </TableCell>
                          <TableCell>{holding.dividendPayout.toFixed(2)}</TableCell>
                          <TableCell className="text-blue-600">{holding.absoluteReturn.toFixed(2)}%</TableCell>
                          <TableCell className="text-blue-600">{holding.xirr.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Asset Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Purchase Allocation
                  </CardTitle>
                  <CardDescription>
                    Original asset allocation at purchase (in {baseCurrency})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={selectedClientData.purchaseAllocation}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {selectedClientData.purchaseAllocation.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Asset Class</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Amount ({baseCurrency})</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedClientData.purchaseAllocation.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.value}%</TableCell>
                              <TableCell>{item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Current Allocation
                  </CardTitle>
                  <CardDescription>
                    Current asset allocation based on market values (in {baseCurrency})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={selectedClientData.currentAllocation}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}%`}
                          >
                            {selectedClientData.currentAllocation.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <ChartTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Asset Class</TableHead>
                            <TableHead>Percentage</TableHead>
                            <TableHead>Amount ({baseCurrency})</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedClientData.currentAllocation.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>{item.value}%</TableCell>
                              <TableCell>{item.amount.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transaction Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Transaction Summary
                </CardTitle>
                <CardDescription className="flex items-center justify-between">
                  <span>All transactions for this client</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="1m">Last Month</SelectItem>
                        <SelectItem value="3m">Last 3 Months</SelectItem>
                        <SelectItem value="6m">Last 6 Months</SelectItem>
                        <SelectItem value="1y">Last Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Instrument Name</TableHead>
                        <TableHead>Asset Class</TableHead>
                        <TableHead>Ticker</TableHead>
                        <TableHead>Transaction Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>Holding Days</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClientData.transactions.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{transaction.instrumentName}</TableCell>
                          <TableCell>{transaction.assetClass}</TableCell>
                          <TableCell>{transaction.ticker}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs ${
                              transaction.transactionType === 'Buy' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {transaction.transactionType}
                            </span>
                          </TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>${transaction.price.toFixed(2)}</TableCell>
                          <TableCell>${transaction.currentPrice.toFixed(2)}</TableCell>
                          <TableCell>{transaction.holdingDays} days</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio AUM */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Portfolio AUM Growth
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Excel
                  </Button>
                </CardTitle>
                <CardDescription>
                  Assets Under Management over time (in {baseCurrency})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <ChartContainer config={chartConfig} className="h-64">
                    <LineChart data={selectedClientData.aumData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="aum" 
                        stroke="var(--color-aum)" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ChartContainer>
                  
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>AUM Value ({baseCurrency})</TableHead>
                          <TableHead>Growth %</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedClientData.aumData.map((item, index) => {
                          const previousValue = index > 0 ? selectedClientData.aumData[index - 1].aum : item.aum;
                          const growth = index > 0 ? ((item.aum - previousValue) / previousValue * 100) : 0;
                          return (
                            <TableRow key={index}>
                              <TableCell>{item.date}</TableCell>
                              <TableCell>{item.aum.toLocaleString()}</TableCell>
                              <TableCell className={growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {growth.toFixed(2)}%
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dividend Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Dividend Summary
                </CardTitle>
                <CardDescription>
                  Dividend payments received by this client
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Instrument Name</TableHead>
                        <TableHead>Dividend Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Currency</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedClientData.dividends.map((dividend, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{dividend.instrumentName}</TableCell>
                          <TableCell>{dividend.dividendDate}</TableCell>
                          <TableCell className="text-green-600">{dividend.currency} {dividend.amount.toFixed(2)}</TableCell>
                          <TableCell>{dividend.currency}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {dividend.type}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!selectedClient && (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Please select a client to view their portfolio reports</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;