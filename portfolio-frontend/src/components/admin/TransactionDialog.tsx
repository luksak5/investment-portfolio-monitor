
import React, { useState, useEffect } from 'react';
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
import { formatDate } from '@/types/transaction';

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;
  onSave: (transaction: Transaction) => void;
}

const TransactionDialog = ({
  isOpen,
  onClose,
  editingTransaction,
  setEditingTransaction,
  onSave
}: TransactionDialogProps) => {
  // State for form data
  const [formData, setFormData] = useState<Transaction>({
    id: '',
    transactionType: 'Buy',
    currency: 'USD',
    account: '',
    symbol: '',
    date: new Date(),
    quantity: 0,
    tradePrice: 0,
    commission: 0,
    exchangeRate: 1.0000,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Update form data when editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setFormData(editingTransaction);
    } else {
      // Reset form for new transaction
      setFormData({
        id: `temp_${Date.now()}`,
        transactionType: 'Buy',
        currency: 'USD',
        account: '',
        symbol: '',
        date: new Date(),
        quantity: 0,
        tradePrice: 0,
        commission: 0,
        exchangeRate: 1.0000,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }, [editingTransaction]);

  const isNewTransaction = formData.id.startsWith('temp_');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {isNewTransaction ? 'Add Transaction' : 'Edit Transaction'}
          </DialogTitle>
          <DialogDescription>
            {isNewTransaction ? 'Add new transaction details below' : 'Modify transaction details below'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formatDate(formData.date)}
              onChange={(e) => setFormData({
                ...formData,
                date: new Date(e.target.value)
              })}
            />
          </div>
          <div>
            <Label htmlFor="account">Account</Label>
            <Input
              id="account"
              value={formData.account}
              onChange={(e) => setFormData({
                ...formData,
                account: e.target.value
              })}
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={formData.currency || 'USD'}
              onValueChange={(value) => setFormData({
                ...formData,
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
                <SelectItem value="INR">INR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="transactionType">Trades</Label>
            <Select
              value={formData.transactionType}
              onValueChange={(value) => setFormData({
                ...formData,
                transactionType: value
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Buy">Buy</SelectItem>
                <SelectItem value="Sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({
                ...formData,
                symbol: e.target.value.toUpperCase()
              })}
            />
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              min="0"
              value={formData.quantity === 0 ? 0 : formData.quantity || ''}
              onChange={(e) => setFormData({
                ...formData,
                quantity: e.target.value ? parseFloat(e.target.value) : null
              })}
            />
          </div>
          <div>
            <Label htmlFor="tradePrice">Trade Price</Label>
            <Input
              id="tradePrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.tradePrice === 0 ? 0 : formData.tradePrice || ''}
              onChange={(e) => setFormData({
                ...formData,
                tradePrice: e.target.value ? parseFloat(e.target.value) : null
              })}
            />
          </div>
          <div>
            <Label htmlFor="commission">Commission</Label>
            <Input
              id="commission"
              type="number"
              step="0.01"
              min="0"
              value={formData.commission === 0 ? 0 : formData.commission || ''}
              onChange={(e) => setFormData({
                ...formData,
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
              value={formData.exchangeRate}
              onChange={(e) => setFormData({
                ...formData,
                exchangeRate: parseFloat(e.target.value) || 1
              })}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({
                ...formData,
                status: value
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="w-4 h-4 mr-2" />
            {isNewTransaction ? 'Add Transaction' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;
