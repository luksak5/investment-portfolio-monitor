
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Plus, Trash2, Search, Filter, X as XIcon, CheckCircle, XCircle } from 'lucide-react';
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
import { supabase } from '@/lib/supabaseClient';

// Account Management
interface Account {
  account: string;
  clientName: string;
  clientEmail: string;
  riskProfile: string;
  baseCurrency: string;
  status?: 'active' | 'inactive';
}

interface AccountManagementProps {
  onAccountChange?: (accounts: Account[]) => void;
  isClientView?: boolean;
  title?: string;
  description?: string;
}

interface FilterState {
  search: string;
  riskProfile: string;
  baseCurrency: string;
}

const AccountManagement = ({ 
  onAccountChange, 
  isClientView = false,
  title = isClientView ? "Client Management" : "Account Management",
  description = isClientView ? "Manage client accounts and their information" : "Manage account information"
}: AccountManagementProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    riskProfile: 'all',
    baseCurrency: 'all'
  });

  // Fetch accounts from Supabase
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientManagement')
        .select('*');

      if (error) {
        console.error('Error fetching accounts:', error);
        alert('Failed to fetch accounts: ' + error.message);
        return;
      }

      setAccounts(data || []);
      if (onAccountChange) {
        onAccountChange(data || []);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      alert('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  // Load accounts on component mount
  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleEdit = (account: Account) => {
    setEditingAccount({ ...account });
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingAccount?.account || !editingAccount?.clientName || !editingAccount?.clientEmail) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const exists = accounts.some(a => a.account === editingAccount.account);
      
      if (exists) {
        // Update existing account
        const { error } = await supabase
          .from('clientManagement')
          .update({
            clientName: editingAccount.clientName,
            clientEmail: editingAccount.clientEmail,
            riskProfile: editingAccount.riskProfile,
            baseCurrency: editingAccount.baseCurrency,
            status: editingAccount.status || 'active'
          })
          .eq('account', editingAccount.account);

        if (error) {
          console.error('Error updating account:', error);
          alert('Failed to update account: ' + error.message);
          return;
        }
      } else {
        // Insert new account
        const { error } = await supabase
          .from('clientManagement')
          .insert([{
            account: editingAccount.account,
            clientName: editingAccount.clientName,
            clientEmail: editingAccount.clientEmail,
            riskProfile: editingAccount.riskProfile,
            baseCurrency: editingAccount.baseCurrency,
            status: editingAccount.status || 'active'
          }]);

        if (error) {
          console.error('Error inserting account:', error);
          alert('Failed to add account: ' + error.message);
          return;
        }
      }

      // Refresh the accounts list
      await fetchAccounts();
      setIsEditDialogOpen(false);
      setEditingAccount(null);
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Failed to save account');
    }
  };

  const handleAddNew = () => {
    const newAccount: Account = {
      account: '',
      clientName: '',
      clientEmail: '',
      riskProfile: 'Conservative',
      baseCurrency: 'USD',
      ...(isClientView && { status: 'active' }),
    };
    setEditingAccount(newAccount);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (account: string) => {
    if (!confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('clientManagement')
        .delete()
        .eq('account', account);

      if (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account: ' + error.message);
        return;
      }

      // Refresh the accounts list
      await fetchAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
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

  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search || 
        account.account.toLowerCase().includes(searchLower) ||
        account.clientName.toLowerCase().includes(searchLower) ||
        account.clientEmail.toLowerCase().includes(searchLower);

      const matchesRiskProfile = filters.riskProfile === 'all' || 
        account.riskProfile === filters.riskProfile;

      const matchesBaseCurrency = filters.baseCurrency === 'all' || 
        account.baseCurrency === filters.baseCurrency;

      return matchesSearch && matchesRiskProfile && matchesBaseCurrency;
    });
  }, [accounts, filters]);

  const hasActiveFilters = filters.search || filters.riskProfile !== 'all' || filters.baseCurrency !== 'all';

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading clients...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-3xl font-bold text-foreground">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
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
                    <h4 className="font-medium">Filter {isClientView ? 'Clients' : 'Accounts'}</h4>
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
                        Showing {filteredAccounts.length} of {accounts.length} {isClientView ? 'clients' : 'accounts'}
                      </p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add {isClientView ? 'Client' : 'Account'}
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
                {isClientView && <TableHead>Status</TableHead>}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isClientView ? 7 : 6} className="text-center py-8 text-muted-foreground">
                    {accounts.length === 0 
                      ? `No ${isClientView ? 'clients' : 'accounts'} found. Add your first ${isClientView ? 'client' : 'account'} to get started.`
                      : `No ${isClientView ? 'clients' : 'accounts'} match your current filters.`
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.account}>
                    <TableCell className="font-mono font-semibold">{account.account}</TableCell>
                    <TableCell>{account.clientName}</TableCell>
                    <TableCell>{account.clientEmail}</TableCell>
                    <TableCell>
                      <Badge className={getRiskProfileColor(account.riskProfile)}>
                        {account.riskProfile}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.baseCurrency}</TableCell>
                    {isClientView && (
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
                    )}
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
                          onClick={() => handleDelete(account.account)}
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

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAccount && accounts.some(a => a.account === editingAccount.account) 
                  ? `Edit ${isClientView ? 'Client' : 'Account'}`
                  : `Add ${isClientView ? 'Client' : 'Account'}`}
              </DialogTitle>
              <DialogDescription>
                Add or edit {isClientView ? 'client' : 'account'} information and details
              </DialogDescription>
            </DialogHeader>
            {editingAccount && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="account">Account Id</Label>
                  <Input
                    id="account"
                    placeholder="e.g., UKRW37605"
                    value={editingAccount.account}
                    onChange={(e) => setEditingAccount({
                      ...editingAccount,
                      account: e.target.value
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
                {isClientView && (
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
                )}
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
  );
};

export default AccountManagement;
