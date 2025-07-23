
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Plus, Trash2, Search, Filter, X as XIcon, CheckCircle, XCircle, ArrowUpRight, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Account Management (now Client Management)
interface Account {
  id: string; // Provided by user or broker terminal
  clientName: string;
  clientEmail: string;
  riskProfile: string;
  baseCurrency: string;
  status: 'active' | 'inactive';
}

interface FilterState {
  search: string;
  riskProfile: string;
  baseCurrency: string;
}

const dummyMovers = {
  'Very Aggressive': [
    { clientName: 'Ava Carter', accountId: 'ACC101', xirr: 22.5 },
    { clientName: 'Liam Patel', accountId: 'ACC102', xirr: 20.1 },
    { clientName: 'Noah Kim', accountId: 'ACC103', xirr: 18.7 },
    { clientName: 'Sophia Lee', accountId: 'ACC104', xirr: 17.9 },
    { clientName: 'Mia Singh', accountId: 'ACC105', xirr: 16.2 },
    { clientName: 'Lucas Wang', accountId: 'ACC106', xirr: 15.8 },
    { clientName: 'Ella Brown', accountId: 'ACC107', xirr: 15.1 },
  ],
  'Aggressive': [
    { clientName: 'Olivia Smith', accountId: 'ACC201', xirr: 14.3 },
    { clientName: 'Benjamin Jones', accountId: 'ACC202', xirr: 13.9 },
    { clientName: 'Charlotte Garcia', accountId: 'ACC203', xirr: 13.2 },
    { clientName: 'Henry Martinez', accountId: 'ACC204', xirr: 12.7 },
    { clientName: 'Amelia Rodriguez', accountId: 'ACC205', xirr: 12.1 },
    { clientName: 'Jack Wilson', accountId: 'ACC206', xirr: 11.8 },
  ],
  'Moderate': [
    { clientName: 'William Anderson', accountId: 'ACC301', xirr: 10.2 },
    { clientName: 'Emily Thomas', accountId: 'ACC302', xirr: 9.8 },
    { clientName: 'James White', accountId: 'ACC303', xirr: 9.5 },
    { clientName: 'Isabella Harris', accountId: 'ACC304', xirr: 9.1 },
    { clientName: 'Alexander Clark', accountId: 'ACC305', xirr: 8.7 },
  ],
  'Conservative': [
    { clientName: 'Lucas Lewis', accountId: 'ACC401', xirr: 7.5 },
    { clientName: 'Mason Young', accountId: 'ACC402', xirr: 7.2 },
    { clientName: 'Harper King', accountId: 'ACC403', xirr: 6.9 },
    { clientName: 'Evelyn Scott', accountId: 'ACC404', xirr: 6.5 },
    { clientName: 'Ella Green', accountId: 'ACC405', xirr: 6.2 },
  ],
};

const riskProfiles = [
  'Very Aggressive',
  'Aggressive',
  'Moderate',
  'Conservative',
];

function fetchTopMovers(riskProfile, limit) {
  const movers = dummyMovers[riskProfile] || [];
  return Promise.resolve(movers.slice(0, limit));
}

const TopClientMovers = () => {
  const [selectedRisk, setSelectedRisk] = useState('Very Aggressive');
  const [topClients, setTopClients] = useState([]);
  const [showAll, setShowAll] = useState(false);

  React.useEffect(() => {
    fetchTopMovers(selectedRisk, showAll ? 1000 : 5).then(setTopClients);
  }, [selectedRisk, showAll]);

  const movers = dummyMovers[selectedRisk] || [];
  const hasMore = movers.length > 5 && !showAll;

  return (
    <Card className="mb-6 border bg-background text-foreground">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          <CardTitle className="text-3xl font-bold text-foreground">Top Client Movers</CardTitle>
        </div>
        <div className="flex gap-2">
          {riskProfiles.map((profile) => (
            <button
              key={profile}
              className={`px-4 py-1 rounded-md font-semibold border transition-colors text-sm
                ${selectedRisk === profile
                  ? 'bg-primary text-primary-foreground border-primary shadow'
                  : 'bg-background text-primary border-border hover:bg-muted'}`}
              onClick={() => { setSelectedRisk(profile); setShowAll(false); }}
            >
              {profile}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {topClients.map((client, idx) => (
            <div key={client.accountId} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-foreground">{idx + 1}.</span>
                <span className="font-semibold text-lg text-foreground">{client.clientName}</span>
                <span className="font-mono text-sm bg-muted px-2 py-1 rounded text-primary border border-border">{client.accountId}</span>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-700">{client.xirr}%</span>
                <span className="text-xs text-muted-foreground">XIRR</span>
              </div>
            </div>
          ))}
        </div>
        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" className="border-primary text-primary font-semibold" onClick={() => setShowAll(true)}>
              View All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AdminClients = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    riskProfile: 'all',
    baseCurrency: 'all'
  });

  const handleEdit = (account: Account) => {
    setEditingAccount({ ...account });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingAccount?.id || !editingAccount?.clientName || !editingAccount?.clientEmail) {
      alert('Please fill in all required fields');
      return;
    }
    if (editingAccount) {
      let updatedAccounts;
      const exists = accounts.some(a => a.id === editingAccount.id);
      if (exists) {
        updatedAccounts = accounts.map(a =>
          a.id === editingAccount.id ? editingAccount : a
        );
      } else {
        updatedAccounts = [...accounts, editingAccount];
      }
      setAccounts(updatedAccounts);
      setIsEditDialogOpen(false);
      setEditingAccount(null);
    }
  };

  const handleAddNew = () => {
    const newAccount: Account = {
      id: '', // User will enter this
      clientName: '',
      clientEmail: '',
      riskProfile: 'Conservative',
      baseCurrency: 'USD',
      status: 'active',
    };
    setEditingAccount(newAccount);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updatedAccounts = accounts.filter(a => a.id !== id);
    setAccounts(updatedAccounts);
  };

  const handleCloseDialog = () => {
    setIsEditDialogOpen(false);
    setEditingAccount(null);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      riskProfile: 'all',
      baseCurrency: 'all'
    });
  };

  const getRiskProfileColor = (profile: string) => {
    switch (profile) {
      case 'Conservative': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Aggressive': return 'bg-orange-100 text-orange-800';
      case 'Very Aggressive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter accounts based on current filters
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        account.id.toLowerCase().includes(searchLower) ||
        account.clientName.toLowerCase().includes(searchLower) ||
        account.clientEmail.toLowerCase().includes(searchLower);

      const matchesRiskProfile = filters.riskProfile === 'all' || 
        account.riskProfile === filters.riskProfile;

      // Base currency filter
      const matchesBaseCurrency = filters.baseCurrency === 'all' || 
        account.baseCurrency === filters.baseCurrency;

      return matchesSearch && matchesRiskProfile && matchesBaseCurrency;
    });
  }, [accounts, filters]);

  const hasActiveFilters = filters.search || filters.riskProfile !== 'all' || filters.baseCurrency !== 'all';

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        <TopClientMovers />
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-3xl font-bold text-foreground">Client Management</CardTitle>
                <CardDescription>
                  Manage client accounts and their information
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                          {[filters.search, filters.riskProfile !== 'all', filters.baseCurrency !== 'all'].filter(Boolean).length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Filter Clients</h4>
                        {hasActiveFilters && (
                          <Button variant="ghost" size="sm" onClick={clearFilters}>
                            <XIcon className="w-4 h-4 mr-1" />
                            Clear
                          </Button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="search">Search</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="search"
                              placeholder="Search by account, name, or email..."
                              value={filters.search}
                              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                              className="pl-9"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="riskProfile">Risk Profile</Label>
                          <Select
                            value={filters.riskProfile}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, riskProfile: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Risk Profiles</SelectItem>
                              <SelectItem value="Conservative">Conservative</SelectItem>
                              <SelectItem value="Moderate">Moderate</SelectItem>
                              <SelectItem value="Aggressive">Aggressive</SelectItem>
                              <SelectItem value="Very Aggressive">Very Aggressive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="baseCurrency">Base Currency</Label>
                          <Select
                            value={filters.baseCurrency}
                            onValueChange={(value) => setFilters(prev => ({ ...prev, baseCurrency: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Currencies</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="INR">INR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {hasActiveFilters && (
                        <div className="pt-2 border-t">
                          <p className="text-sm text-muted-foreground">
                            Showing {filteredAccounts.length} of {accounts.length} clients
                          </p>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <Button onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Id</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Email Id</TableHead>
                    <TableHead>Risk Profile</TableHead>
                    <TableHead>Base Currency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        {accounts.length === 0 
                          ? "No clients found. Add your first client to get started."
                          : "No clients match your current filters."
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-mono font-semibold">{account.id}</TableCell>
                        <TableCell>{account.clientName}</TableCell>
                        <TableCell>{account.clientEmail}</TableCell>
                        <TableCell>
                          <Badge className={getRiskProfileColor(account.riskProfile)}>
                            {account.riskProfile}
                          </Badge>
                        </TableCell>
                        <TableCell>{account.baseCurrency}</TableCell>
                        <TableCell>
                          {account.status === 'active' ? (
                            <span className="flex items-center gap-1 text-green-800 font-semibold">
                              <CheckCircle className="w-4 h-4 text-green-700" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-700 font-semibold">
                              <XCircle className="w-4 h-4 text-red-600" /> Inactive
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(account)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(account.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Edit/Add Client Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingAccount && accounts.some(a => a.id === editingAccount.id) ? 'Edit Client' : 'Add Client'}
                  </DialogTitle>
                  <DialogDescription>
                    Add or edit client information and details
                  </DialogDescription>
                </DialogHeader>
                {editingAccount && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="id">Account Id</Label>
                      <Input
                        id="id"
                        placeholder="e.g., UKRW37605"
                        value={editingAccount.id}
                        onChange={(e) => setEditingAccount({
                          ...editingAccount,
                          id: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        placeholder="e.g., John Doe"
                        value={editingAccount.clientName}
                        onChange={(e) => setEditingAccount({
                          ...editingAccount,
                          clientName: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Client Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        placeholder="e.g., john.doe@email.com"
                        value={editingAccount.clientEmail}
                        onChange={(e) => setEditingAccount({
                          ...editingAccount,
                          clientEmail: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="riskProfile">Risk Profile</Label>
                      <Select
                        value={editingAccount.riskProfile}
                        onValueChange={(value) => setEditingAccount({
                          ...editingAccount,
                          riskProfile: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Conservative">Conservative</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Aggressive">Aggressive</SelectItem>
                          <SelectItem value="Very Aggressive">Very Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="baseCurrency">Base Currency</Label>
                      <Select
                        value={editingAccount.baseCurrency}
                        onValueChange={(value) => setEditingAccount({
                          ...editingAccount,
                          baseCurrency: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editingAccount.status}
                        onValueChange={(value) => setEditingAccount({
                          ...editingAccount,
                          status: value as 'active' | 'inactive'
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminClients;
