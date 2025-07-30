/**
 * @fileoverview Dividend dialog component for adding and editing dividends
 * @description Form dialog for creating and modifying dividend records
 * @version 1.0.0
 * @author Portfolio Monitor Team
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Dividend } from '@/types/dividend';
import { formatDate } from '@/types/dividend';

/**
 * Props interface for the DividendDialog component.
 * 
 * @interface DividendDialogProps
 * @description Component properties for dividend dialog
 * 
 * @property {boolean} isOpen - Whether the dialog is open
 * @property {Dividend | null} editingDividend - Dividend being edited (null for new dividend)
 * @property {() => void} onClose - Callback function to close the dialog
 * @property {(dividend: Dividend) => void} onSave - Callback function to save the dividend
 */
interface DividendDialogProps {
  isOpen: boolean;
  editingDividend: Dividend | null;
  onClose: () => void;
  onSave: (dividend: Dividend) => void;
}

/**
 * Dialog component for adding and editing dividends.
 * 
 * @component DividendDialog
 * @description Form dialog for creating and modifying dividend records
 * 
 * @param {DividendDialogProps} props - Component properties
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {Dividend | null} props.editingDividend - Dividend being edited (null for new dividend)
 * @param {() => void} props.onClose - Callback to close the dialog
 * @param {(dividend: Dividend) => void} props.onSave - Callback to save the dividend
 * 
 * @example
 * ```tsx
 * <DividendDialog
 *   isOpen={isDialogOpen}
 *   editingDividend={currentDividend}
 *   onClose={handleClose}
 *   onSave={handleSave}
 * />
 * ```
 * 
 * @features
 * - Form validation
 * - Currency selection
 * - Date input handling
 * - Symbol uppercase conversion
 * - Amount validation
 * 
 * @dependencies
 * - @/types/dividend
 * - @/components/ui/dialog
 * - @/components/ui/button
 * - @/components/ui/input
 * - @/components/ui/select
 * 
 * @since 1.0.0
 * @author Portfolio Monitor Team
 */
const DividendDialog = ({ isOpen, editingDividend, onClose, onSave }: DividendDialogProps) => {
  // State for form data
  const [formData, setFormData] = useState<Dividend>({
    id: '',
    transactionType: 'Dividends',
    currency: 'USD',
    account: '',
    symbol: '',
    date: new Date(),
    amount: 0,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  // Update form data when editingDividend changes
  useEffect(() => {
    if (editingDividend) {
      setFormData(editingDividend);
    } else {
      // Reset form for new dividend
      setFormData({
        id: `temp_${Date.now()}`,
        transactionType: 'Dividends',
        currency: 'USD',
        account: '',
        symbol: '',
        date: new Date(),
        amount: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }, [editingDividend]);

  /**
   * Handles form submission.
   * 
   * @function handleSubmit
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.account.trim()) {
      alert('Please enter an account');
      return;
    }
    
    if (!formData.symbol.trim()) {
      alert('Please enter a symbol');
      return;
    }
    
    if (formData.amount < 0) {
      alert('Amount must be greater than or equal to 0');
      return;
    }

    // Convert symbol to uppercase
    const dividendToSave = {
      ...formData,
      symbol: formData.symbol.toUpperCase()
    };

    onSave(dividendToSave);
    onClose();
  };

  /**
   * Handles input changes.
   * 
   * @function handleInputChange
   * @param {string} field - Field name to update
   * @param {string | number} value - New value
   */
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handles date input changes.
   * 
   * @function handleDateChange
   * @param {string} dateStr - Date string from input
   */
  const handleDateChange = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        setFormData(prev => ({
          ...prev,
          date: date
        }));
      }
    } catch (error) {
      console.error('Invalid date:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingDividend ? 'Edit Dividend' : 'Add Dividend'}
          </DialogTitle>
          <DialogDescription>
            {editingDividend ? 'Modify the dividend details below.' : 'Enter the dividend details below.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transactionType">Transaction Type</Label>
              <Select
                value={formData.transactionType}
                onValueChange={(value) => handleInputChange('transactionType', value)}
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dividends">Dividends</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleInputChange('currency', value)}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account">Account</Label>
              <Input
                id="account"
                value={formData.account}
                onChange={(e) => handleInputChange('account', e.target.value)}
                placeholder="Enter account number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
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

          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol</Label>
            <Input
              id="symbol"
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value)}
              placeholder="Enter stock symbol"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formatDate(formData.date)}
              onChange={(e) => handleDateChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount === 0 ? 0 : formData.amount || ''}
              onChange={(e) => handleInputChange('amount', e.target.value ? parseFloat(e.target.value) : 0)}
              placeholder="Enter dividend amount"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {editingDividend ? 'Update Dividend' : 'Add Dividend'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DividendDialog; 