/**
 * @fileoverview Dividend table component for displaying dividend data
 * @description Main table component with sorting, filtering, and bulk actions for dividends
 * @version 1.0.0
 * @author Portfolio Monitor Team
 */

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
import type { Dividend } from '@/types/dividend';
import { formatDate } from '@/types/dividend';

/**
 * Converts currency codes to their corresponding symbols.
 * 
 * @function getCurrencySymbol
 * @description Maps currency codes to display symbols
 * 
 * @param {string | null | undefined} currency - Currency code
 * @param {string} [defaultCurrency='USD'] - Default currency if none provided
 * @returns {string} Currency symbol
 * 
 * @example
 * ```typescript
 * getCurrencySymbol('USD')     // Returns '$'
 * getCurrencySymbol('EUR')     // Returns '€'
 * getCurrencySymbol('GBP')     // Returns '£'
 * getCurrencySymbol('INR')     // Returns '₹'
 * getCurrencySymbol(null)      // Returns '$' (default)
 * ```
 */
const getCurrencySymbol = (currency: string | null | undefined = 'USD') => {
  if (!currency) return '$'; // Default to USD if currency is null/undefined
  switch(currency.toUpperCase()) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'INR': return '₹';
    default: return currency;
  }
};

/**
 * Formats monetary amounts with currency symbols.
 * 
 * @function formatMoneyWithCurrency
 * @description Displays amounts with appropriate currency formatting
 * 
 * @param {number | null} amount - Amount to format
 * @param {string | null | undefined} currency - Currency code
 * @param {string} [defaultCurrency='USD'] - Default currency if none provided
 * @returns {string} Formatted amount with currency symbol
 * 
 * @example
 * ```typescript
 * formatMoneyWithCurrency(150.25, 'USD')  // Returns '$150.25'
 * formatMoneyWithCurrency(100.50, 'EUR')  // Returns '€100.50'
 * formatMoneyWithCurrency(null, 'USD')    // Returns '-'
 * ```
 */
const formatMoneyWithCurrency = (amount: number | null, currency: string | null | undefined = 'USD') => {
  if (amount === null) return '-';
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
};

/**
 * Returns CSS classes for dividend type badges.
 * 
 * @function getDividendTypeColor
 * @param {string} type - Dividend type (always 'Dividends')
 * @returns {string} CSS classes for styling
 * 
 * @example
 * ```typescript
 * getDividendTypeColor('Dividends')   // Returns 'bg-blue-100 text-blue-800'
 * ```
 */
const getDividendTypeColor = (type: string) => {
  switch (type) {
    case 'Dividends': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Returns CSS classes for status badges.
 * 
 * @function getStatusColor
 * @param {string} status - Status ('active' or 'inactive')
 * @returns {string} CSS classes for styling
 * 
 * @example
 * ```typescript
 * getStatusColor('active')   // Returns 'bg-green-100 text-green-800'
 * getStatusColor('inactive') // Returns 'bg-red-100 text-red-800'
 * ```
 */
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'inactive': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Props interface for the DividendTable component.
 * 
 * @interface DividendTableProps
 * @description Component properties for dividend table
 * 
 * @property {Dividend[]} dividends - Array of dividends to display
 * @property {() => void} onAddNew - Callback function for adding new dividend
 * @property {(dividend: Dividend) => void} onEdit - Callback function for editing dividend
 * @property {(ids: string[]) => void} onDelete - Callback function for deleting dividends
 */
interface DividendTableProps {
  dividends: Dividend[];
  onAddNew: () => void;
  onEdit: (dividend: Dividend) => void;
  onDelete: (ids: string[]) => void;
}

/**
 * Displays a table of dividends with sorting, filtering, and bulk actions.
 * 
 * @component DividendTable
 * @description Main table component for dividend management
 * 
 * @param {DividendTableProps} props - Component properties
 * @param {Dividend[]} props.dividends - Array of dividends to display
 * @param {() => void} props.onAddNew - Callback for adding new dividend
 * @param {(dividend: Dividend) => void} props.onEdit - Callback for editing dividend
 * @param {(ids: string[]) => void} props.onDelete - Callback for bulk deletion
 * 
 * @example
 * ```tsx
 * <DividendTable
 *   dividends={dividends}
 *   onAddNew={handleAddNew}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 * 
 * @features
 * - Responsive table design
 * - Bulk selection with checkboxes
 * - Currency symbol display
 * - Formatted monetary values
 * - Action dropdown for each row
 * - Dividend type color coding
 * - Status display with color coding
 * - Created and updated timestamps
 * 
 * @dependencies
 * - @/types/dividend
 * - @/components/ui/table
 * - @/components/ui/button
 * - @/components/ui/card
 * - lucide-react icons
 * 
 * @since 1.0.0
 * @author Portfolio Monitor Team
 */
const DividendTable = ({ 
  dividends, 
  onAddNew,
  onEdit,
  onDelete
}: DividendTableProps) => {
  // State for managing selected dividends
  const [selectedDividends, setSelectedDividends] = useState<Set<string>>(new Set());

  /**
   * Handles selecting/deselecting all dividends.
   * 
   * @function handleSelectAll
   * @param {boolean} checked - Whether to select or deselect all
   */
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDividends(new Set(dividends.map(d => d.id)));
    } else {
      setSelectedDividends(new Set());
    }
  };

  /**
   * Handles selecting/deselecting individual dividends.
   * 
   * @function handleSelectDividend
   * @param {string} id - Dividend ID
   * @param {boolean} checked - Whether to select or deselect
   */
  const handleSelectDividend = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedDividends);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedDividends(newSelected);
  };

  /**
   * Handles bulk deletion of selected dividends.
   * 
   * @function handleBulkDelete
   * @description Shows confirmation dialog and deletes selected dividends
   */
  const handleBulkDelete = () => {
    if (selectedDividends.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedDividends.size} dividend(s)?`)) {
      onDelete(Array.from(selectedDividends));
      setSelectedDividends(new Set());
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Dividends ({dividends.length})</CardTitle>
            <CardDescription>
              All dividend payment records
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {selectedDividends.size > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedDividends.size})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onAddNew}>
              <Edit className="w-4 h-4 mr-2" />
              Add Dividend
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
                    checked={selectedDividends.size === dividends.length}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dividends.map((dividend) => (
                <TableRow key={dividend.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedDividends.has(dividend.id)}
                      onCheckedChange={(checked) => 
                        handleSelectDividend(dividend.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Badge className={getDividendTypeColor(dividend.transactionType)}>
                      {dividend.transactionType}
                    </Badge>
                  </TableCell>
                  <TableCell>{dividend.currency || 'USD'}</TableCell>
                  <TableCell>
                    <div className="font-mono text-sm font-semibold">
                      {dividend.account}
                    </div>
                  </TableCell>
                  <TableCell>{dividend.symbol}</TableCell>
                  <TableCell>{formatDate(dividend.date)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(dividend.status || 'active')}>
                      {dividend.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell title={new Date(dividend.created_at).toLocaleString()}>
                    {new Date(dividend.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell title={new Date(dividend.updated_at).toLocaleString()}>
                    {new Date(dividend.updated_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatMoneyWithCurrency(dividend.amount, dividend.currency)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(dividend)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this dividend?')) {
                              onDelete([dividend.id]);
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

export default DividendTable; 