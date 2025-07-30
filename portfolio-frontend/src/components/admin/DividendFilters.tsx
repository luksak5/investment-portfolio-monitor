/**
 * @fileoverview Dividend filters component for filtering dividend data
 * @description Filter controls for searching and filtering dividends
 * @version 1.0.0
 * @author Portfolio Monitor Team
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * Props interface for the DividendFilters component.
 * 
 * @interface DividendFiltersProps
 * @description Component properties for dividend filters
 * 
 * @property {string} searchTerm - Current search term
 * @property {(term: string) => void} onSearchChange - Callback for search term changes
 * @property {Date | undefined} startDate - Start date for date range filter
 * @property {Date | undefined} endDate - End date for date range filter
 * @property {(date: Date | undefined) => void} onStartDateChange - Callback for start date changes
 * @property {(date: Date | undefined) => void} onEndDateChange - Callback for end date changes
 * @property {string} statusFilter - Current status filter ('all', 'active', 'inactive')
 * @property {(status: string) => void} onStatusFilterChange - Callback for status filter changes
 * @property {() => void} onClearFilters - Callback to clear all filters
 */
interface DividendFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onClearFilters: () => void;
}

/**
 * Filter controls for searching and filtering dividends.
 * 
 * @component DividendFilters
 * @description Filter controls for dividend data with search and date range functionality
 * 
 * @param {DividendFiltersProps} props - Component properties
 * @param {string} props.searchTerm - Current search term
 * @param {(term: string) => void} props.onSearchChange - Callback for search term changes
 * @param {Date | undefined} props.startDate - Start date for date range filter
 * @param {Date | undefined} props.endDate - End date for date range filter
 * @param {(date: Date | undefined) => void} props.onStartDateChange - Callback for start date changes
 * @param {(date: Date | undefined) => void} props.onEndDateChange - Callback for end date changes
 * @param {() => void} props.onClearFilters - Callback to clear all filters
 * 
 * @example
 * ```tsx
 * <DividendFilters
 *   searchTerm={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   startDate={startDate}
 *   endDate={endDate}
 *   onStartDateChange={setStartDate}
 *   onEndDateChange={setEndDate}
 *   onClearFilters={handleClearFilters}
 * />
 * ```
 * 
 * @features
 * - Search by account, symbol, and currency
 * - Date range filtering
 * - Clear filters functionality
 * - Responsive design
 * 
 * @dependencies
 * - @/components/ui/card
 * - @/components/ui/input
 * - @/components/ui/button
 * - @/components/ui/popover
 * - @/components/ui/calendar
 * - lucide-react icons
 * - date-fns
 * 
 * @since 1.0.0
 * @author Portfolio Monitor Team
 */
const DividendFilters = ({
  searchTerm,
  onSearchChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  statusFilter,
  onStatusFilterChange,
  onClearFilters
}: DividendFiltersProps) => {
  /**
   * Handles clearing all filters.
   * 
   * @function handleClearFilters
   */
  const handleClearFilters = () => {
    onSearchChange('');
    onStartDateChange(undefined);
    onEndDateChange(undefined);
    onStatusFilterChange('all');
    onClearFilters();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </CardTitle>
        <CardDescription>
          Filter dividends by search terms, date ranges, and status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Filter */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="search"
              placeholder="Search by account, symbol, or currency..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={onStatusFilterChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="startDate" className="text-sm">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => onStartDateChange(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate" className="text-sm">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => onEndDateChange(e.target.value ? new Date(e.target.value) : undefined)}
                min={startDate ? format(startDate, 'yyyy-MM-dd') : undefined}
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || startDate || endDate || statusFilter !== 'all') && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DividendFilters; 