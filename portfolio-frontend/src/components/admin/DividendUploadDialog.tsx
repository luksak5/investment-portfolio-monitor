/**
 * @fileoverview Dividend upload dialog component for CSV import
 * @description Dialog for uploading and processing dividend CSV files
 * @version 1.0.0
 * @author Portfolio Monitor Team
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Papa from 'papaparse';
import type { Dividend } from '@/types/dividend';
import { convertDate } from '@/types/dividend';

/**
 * Props interface for the DividendUploadDialog component.
 * 
 * @interface DividendUploadDialogProps
 * @description Component properties for dividend upload dialog
 * 
 * @property {boolean} isOpen - Whether the dialog is open
 * @property {() => void} onClose - Callback function to close the dialog
 * @property {(dividends: Dividend[]) => void} onUpload - Callback function to handle uploaded dividends
 */
interface DividendUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (dividends: Dividend[]) => void;
}

/**
 * Dialog component for uploading dividend CSV files.
 * 
 * @component DividendUploadDialog
 * @description Dialog for uploading and processing dividend CSV files with validation
 * 
 * @param {DividendUploadDialogProps} props - Component properties
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {() => void} props.onClose - Callback to close the dialog
 * @param {(dividends: Dividend[]) => void} props.onUpload - Callback to handle uploaded dividends
 * 
 * @example
 * ```tsx
 * <DividendUploadDialog
 *   isOpen={isUploadOpen}
 *   onClose={handleCloseUpload}
 *   onUpload={handleDividendUpload}
 * />
 * ```
 * 
 * @features
 * - CSV file upload and parsing
 * - Data validation
 * - Error handling
 * - Progress feedback
 * - Duplicate checking
 * 
 * @dependencies
 * - papaparse
 * - @/types/dividend
 * - @/components/ui/dialog
 * - @/components/ui/button
 * - @/components/ui/input
 * - @/components/ui/alert
 * - lucide-react icons
 * 
 * @since 1.0.0
 * @author Portfolio Monitor Team
 */
const DividendUploadDialog = ({ isOpen, onClose, onUpload }: DividendUploadDialogProps) => {
  // State for file handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [processedCount, setProcessedCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);

  /**
   * Handles file selection.
   * 
   * @function handleFileSelect
   * @param {React.ChangeEvent<HTMLInputElement>} e - File input change event
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadStatus('idle');
      setErrorMessage('');
    } else {
      setErrorMessage('Please select a valid CSV file.');
      setUploadStatus('error');
    }
  };

  /**
   * Processes the uploaded CSV file.
   * 
   * @function handleFileUpload
   */
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const text = await selectedFile.text();
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const dividends: Dividend[] = [];
            const duplicates: string[] = [];
            
            results.data.forEach((row: any, index: number) => {
              try {
                // Validate required headers
                const requiredHeaders = ['Transaction Type', 'Currency', 'Account', 'Symbol', 'Date', 'Amount'];
                const missingHeaders = requiredHeaders.filter(header => !row[header]);
                
                if (missingHeaders.length > 0) {
                  throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
                }

                // Validate transaction type
                if (row['Transaction Type'] !== 'Dividends') {
                  throw new Error(`Invalid transaction type: ${row['Transaction Type']}. Expected 'Dividends'`);
                }

                // Parse date
                let transactionDate: Date;
                try {
                  transactionDate = convertDate(row['Date']);
                } catch (dateError) {
                  throw new Error(`Invalid date format in row ${index + 1}: ${row['Date']}`);
                }

                // Parse amount
                const amount = parseFloat(row['Amount']);
                if (isNaN(amount) || amount < 0) {
                  throw new Error(`Invalid amount in row ${index + 1}: ${row['Amount']}`);
                }

                // Create dividend object
                const dividend: Dividend = {
                  id: `temp_${Date.now()}_${index}`,
                  transactionType: row['Transaction Type'],
                  currency: row['Currency'] || 'USD',
                  account: row['Account'],
                  symbol: row['Symbol'].toUpperCase(),
                  date: transactionDate,
                  amount: amount
                };

                // Check for duplicates (simple check based on account, symbol, date, and amount)
                const duplicateKey = `${dividend.account}-${dividend.symbol}-${dividend.date.toISOString().split('T')[0]}-${dividend.amount}`;
                
                if (duplicates.includes(duplicateKey)) {
                  setDuplicateCount(prev => prev + 1);
                } else {
                  duplicates.push(duplicateKey);
                  dividends.push(dividend);
                }

              } catch (rowError) {
                throw new Error(`Row ${index + 1}: ${rowError instanceof Error ? rowError.message : 'Unknown error'}`);
              }
            });

            setProcessedCount(dividends.length);
            
            if (dividends.length > 0) {
              onUpload(dividends);
              setUploadStatus('success');
            } else {
              setErrorMessage('No valid dividends found in the CSV file.');
              setUploadStatus('error');
            }

          } catch (parseError) {
            setErrorMessage(parseError instanceof Error ? parseError.message : 'Failed to parse CSV file');
            setUploadStatus('error');
          }
        },
        error: (error) => {
          setErrorMessage(`CSV parsing error: ${error.message}`);
          setUploadStatus('error');
        }
      });

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to read file');
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Resets the dialog state.
   * 
   * @function handleClose
   */
  const handleClose = () => {
    setSelectedFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    setProcessedCount(0);
    setDuplicateCount(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Dividends CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file with dividend data. The file should have headers: Transaction Type, Currency, Account, Symbol, Date, Amount
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isProcessing}
            />
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                {selectedFile.name}
              </div>
            )}
          </div>

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully processed {processedCount} dividend(s).
                {duplicateCount > 0 && ` Skipped ${duplicateCount} duplicate(s).`}
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Sample CSV Format */}
          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-2">Expected CSV format:</p>
            <div className="bg-gray-50 p-3 rounded text-xs font-mono">
              Transaction Type,Currency,Account,Symbol,Date,Amount<br />
              Dividends,USD,ACC001234,AAPL,2024-01-15,150.25<br />
              Dividends,EUR,ACC005678,GOOGL,2024-02-20,200.50
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleFileUpload} 
            disabled={!selectedFile || isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DividendUploadDialog; 