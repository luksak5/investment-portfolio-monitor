
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
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
import type { Transaction } from '@/types/transaction';

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;
  onSave: () => void;
}

const TransactionDialog = ({
  isOpen,
  onClose,
  editingTransaction,
  setEditingTransaction,
  onSave
}: TransactionDialogProps) => {
  if (!editingTransaction) return null;

  const isNewTransaction = editingTransaction.id === Date.now().toString();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isNewTransaction ? 'Add New Transaction' : 'Edit Transaction'}
          </DialogTitle>
          <DialogDescription>
            Modify transaction details below
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={editingTransaction.date}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                date: e.target.value
              })}
            />
          </div>
          <div>
            <Label htmlFor="account">Account</Label>
            <Input
              id="account"
              value={editingTransaction.account}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                account: e.target.value
              })}
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={editingTransaction.currency || 'USD'}
              onValueChange={(value) => setEditingTransaction({
                ...editingTransaction,
                currency: value
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="transactionType">Trades</Label>
            <Select
              value={editingTransaction.transactionType}
              onValueChange={(value) => setEditingTransaction({
                ...editingTransaction,
                transactionType: value
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Buy">Buy</SelectItem>
                <SelectItem value="Sell">Sell</SelectItem>
                <SelectItem value="Dividend">Dividend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              value={editingTransaction.symbol}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                symbol: e.target.value
              })}
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              value={editingTransaction.quantity || ''}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                quantity: e.target.value ? parseFloat(e.target.value) : null
              })}
            />
          </div>
          <div>
            <Label htmlFor="price">Trade Price</Label>
            <Input
              id="price"
              type="number"
              step="0.0001"
              value={editingTransaction.price || ''}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                price: e.target.value ? parseFloat(e.target.value) : null
              })}
            />
          </div>
          <div>
            <Label htmlFor="commission">Commission</Label>
            <Input
              id="commission"
              type="number"
              step="0.01"
              value={editingTransaction.commission || ''}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                commission: e.target.value ? parseFloat(e.target.value) : null
              })}
            />
          </div>
          <div>
            <Label htmlFor="exchangeRate">Exchange Rate</Label>
            <Input
              id="exchangeRate"
              type="number"
              step="0.0001"
              value={editingTransaction.exchangeRate}
              onChange={(e) => setEditingTransaction({
                ...editingTransaction,
                exchangeRate: parseFloat(e.target.value) || 1
              })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Transaction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;
