
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Transaction, AccountMapping } from '@/types/transaction';

interface TransactionTableProps {
  transactions: Transaction[];
  accountMappings: AccountMapping[];
  onAddNew: () => void;
}

const TransactionTable = ({ 
  transactions, 
  accountMappings, 
  onAddNew
}: TransactionTableProps) => {
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
                <TableHead>Trades</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Trade Price</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Exchange Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
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
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="text-right">
                    {transaction.quantity !== null ? transaction.quantity.toFixed(2) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.price !== null ? `$${transaction.price.toFixed(4)}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.commission !== null ? `$${transaction.commission.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">{transaction.exchangeRate.toFixed(4)}</TableCell>
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
