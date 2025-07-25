
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Transaction, AccountMapping } from '@/types/transaction';
import { formatDate } from '@/types/transaction';

const getCurrencySymbol = (currency: string = 'USD') => {
  switch(currency.toUpperCase()) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'INR': return '₹';
    default: return currency;
  }
};

const formatMoneyWithCurrency = (amount: number | null, currency: string = 'USD') => {
  if (amount === null) return '-';
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
};

interface TransactionTableProps {
  transactions: Transaction[];
  accountMappings: AccountMapping[];
  onAddNew: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (ids: string[]) => void;
}

const TransactionTable = ({ 
  transactions, 
  accountMappings, 
  onAddNew,
  onEdit,
  onDelete
}: TransactionTableProps) => {
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(new Set(transactions.map(t => t.id)));
    } else {
      setSelectedTransactions(new Set());
    }
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedTransactions);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedTransactions(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedTransactions.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedTransactions.size} transaction(s)?`)) {
      onDelete(Array.from(selectedTransactions));
      setSelectedTransactions(new Set());
    }
  };

  const getClientName = (account: string) => {
    const mapping = accountMappings.find(m => m.fullAccount === account && m.isActive);
    return mapping ? mapping.clientName : 'Unknown Client';
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'Buy': return 'bg-green-100 text-green-800';
      case 'Sell': return 'bg-red-100 text-red-800';
      case 'Credit Interest': return 'bg-blue-100 text-blue-800';
      case 'Deposit': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Transactions ({transactions.length})</CardTitle>
            <CardDescription>
              All transaction records with resolved account mappings
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {selectedTransactions.size > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedTransactions.size})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onAddNew}>
              <Edit className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedTransactions.size === transactions.length}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </TableHead>
                <TableHead>Trades</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Trade Price</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Exchange Rate</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedTransactions.has(transaction.id)}
                      onCheckedChange={(checked) => 
                        handleSelectTransaction(transaction.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Badge className={getTransactionTypeColor(transaction.transactionType)}>
                      {transaction.transactionType}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.currency || 'USD'}</TableCell>
                  <TableCell>
                    <div className="font-mono text-sm font-semibold">
                      {transaction.account}
                    </div>
                  </TableCell>
                  <TableCell>{transaction.symbol}</TableCell>
                  <TableCell>{formatDate(transaction.date)}</TableCell>
                  <TableCell className="text-right">
                    {transaction.quantity !== null ? transaction.quantity.toFixed(2) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMoneyWithCurrency(transaction.price, transaction.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMoneyWithCurrency(transaction.commission, transaction.currency)}
                  </TableCell>
                  <TableCell className="text-right">{transaction.exchangeRate.toFixed(4)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(transaction)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this transaction?')) {
                              onDelete([transaction.id]);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionTable;
