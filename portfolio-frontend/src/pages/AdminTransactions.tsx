import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Upload, Download, Plus, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TransactionFilters from '@/components/admin/TransactionFilters';
import TransactionTable from '@/components/admin/TransactionTable';
import TransactionDialog from '@/components/admin/TransactionDialog';
import UploadDialog from '@/components/admin/UploadDialog';
import DividendFilters from '@/components/admin/DividendFilters';
import DividendTable from '@/components/admin/DividendTable';
import DividendDialog from '@/components/admin/DividendDialog';
import DividendUploadDialog from '@/components/admin/DividendUploadDialog';
import type { Transaction } from '@/types/transaction';
import type { Dividend } from '@/types/dividend';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabaseClient';
import { convertDate, formatDate } from '@/types/transaction';
import { convertDate as convertDividendDate, formatDate as formatDividendDate } from '@/types/dividend';

const getTransactionKey = (t: Partial<Transaction>) =>
  [t.date, t.account, t.transactionType, t.symbol, t.quantity, t.tradePrice].join('|');

const getDividendKey = (d: Partial<Dividend>) =>
  [d.date, d.account, d.transactionType, d.symbol, d.amount].join('|');

const AdminTransactions = () => {
  // Transaction states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadLogs, setUploadLogs] = useState<Array<{
    id: string;
    fileName: string;
    uploadDate: string;
    newTransactions: number;
    totalTransactions: number;
    duplicates: number;
  }>>([]);

  // Dividend states
  const [dividends, setDividends] = useState<Dividend[]>([]);
  const [editingDividend, setEditingDividend] = useState<Dividend | null>(null);
  const [isDividendEditDialogOpen, setIsDividendEditDialogOpen] = useState(false);
  const [dividendSearchTerm, setDividendSearchTerm] = useState('');
  const [dividendStartDate, setDividendStartDate] = useState<Date | undefined>(undefined);
  const [dividendEndDate, setDividendEndDate] = useState<Date | undefined>(undefined);
  const [dividendStatusFilter, setDividendStatusFilter] = useState('all');
  const [isDividendUploadDialogOpen, setIsDividendUploadDialogOpen] = useState(false);
  const [dividendUploadLogs, setDividendUploadLogs] = useState<Array<{
    id: string;
    fileName: string;
    uploadDate: string;
    newDividends: number;
    totalDividends: number;
    duplicates: number;
  }>>([]);

  const [activeTab, setActiveTab] = useState('transactions');

  // Fetch data on component mount
  useEffect(() => {
    fetchTransactions();
    fetchDividends();
  }, []);

  // Transaction functions
  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*');
      
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      alert('Failed to fetch transactions');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction({ ...transaction });
    setIsEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingTransaction) return;

    try {
      if (editingTransaction.id.startsWith('temp_')) {
        // New transaction
        const { id, ...transactionData } = editingTransaction;
        const { data, error } = await supabase
          .from('transactions')
          .insert([transactionData])
          .select()
          .single();

        if (error) throw error;
        
        setTransactions(prev => [...prev, data]);
      } else {
        // Update existing transaction
        const { error } = await supabase
          .from('transactions')
          .update(editingTransaction)
          .eq('id', editingTransaction.id);

        if (error) throw error;

        setTransactions(prev => 
          prev.map(t => t.id === editingTransaction.id ? editingTransaction : t)
        );
      }

      setIsEditDialogOpen(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction');
    }
  };

  const handleDelete = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', ids);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => !ids.includes(t.id)));
    } catch (error) {
      console.error('Error deleting transactions:', error);
      alert('Failed to delete transactions');
    }
  };

  const handleAddNew = () => {
    const newTransaction: Transaction = {
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
    };
    setEditingTransaction(newTransaction);
    setIsEditDialogOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            console.log('Parsing CSV:', results.data);
            const parsedData = results.data as any[];
            
            if (parsedData.length === 0) {
              alert('No data found in CSV file');
              return;
            }

            // First fetch latest transactions to ensure accurate duplicate checking
            const { data: existingTransactions, error: fetchError } = await supabase
              .from('transactions')
              .select('*');

            if (fetchError) {
              throw new Error('Failed to check for existing transactions');
            }

            // Create unique keys for existing transactions
            const existingKeys = new Set(
              (existingTransactions || []).map(t => 
                `${formatDate(t.date)}|${t.account}|${t.transactionType}|${t.symbol}|${t.quantity}|${t.tradePrice}`
              )
            );

            // Process new transactions
            const newTransactions = parsedData.map(row => {
              // Handle date conversion first
              let transactionDate: Date;
              try {
                transactionDate = row['Date'] ? convertDate(row['Date']) : new Date();
              } catch (error) {
                console.error('Date conversion error:', error);
                transactionDate = new Date(row['Date']); // Fallback to direct conversion
              }

              return {
                transactionType: row['Transaction Type'] || 'Buy',
                currency: row['Currency'] || 'USD',
                account: row['Account'] || '',
                symbol: row['Symbol'] || '',
                date: transactionDate,
                quantity: row['Quantity'] ? parseFloat(row['Quantity']) : 0,
                tradePrice: row['Trade Price'] ? parseFloat(row['Trade Price']) : 0,
                commission: row['Commission'] ? parseFloat(row['Commission']) : 0,
                exchangeRate: row['Exchange Rate'] ? parseFloat(row['Exchange Rate']) : 1.0
              };
            });

            // Check for duplicates using the same key format
            const uniqueNewTransactions = newTransactions.filter(t => {
              const key = `${formatDate(t.date)}|${t.account}|${t.transactionType}|${t.symbol}|${t.quantity}|${t.tradePrice}`;
              return !existingKeys.has(key);
            });

            const duplicates = newTransactions.length - uniqueNewTransactions.length;

            if (duplicates > 0) {
              console.log(`Found ${duplicates} duplicate transactions`);
            }

            if (uniqueNewTransactions.length === 0) {
              alert('All transactions in this file are duplicates');
              return;
            }

            // Insert unique transactions
            const { error: uploadError } = await supabase
              .from('transactions')
              .insert(uniqueNewTransactions);

            if (uploadError) {
              console.error('Supabase upload error:', uploadError);
              throw uploadError;
            }

            // Refresh transactions from database
            await fetchTransactions();

            // Add upload log
            const uploadLog = {
              id: Date.now().toString(),
              fileName: file.name,
              uploadDate: new Date().toLocaleString(),
              newTransactions: uniqueNewTransactions.length,
              totalTransactions: parsedData.length,
              duplicates: duplicates
            };
            setUploadLogs(prev => [uploadLog, ...prev.slice(0, 4)]);

            alert(`Successfully uploaded ${uniqueNewTransactions.length} transactions. ${duplicates} duplicates were skipped.`);
            setIsUploadDialogOpen(false);

          } catch (error) {
            console.error('Error processing CSV:', error);
            alert('Failed to process CSV file: ' + (error as Error).message);
          }
        },
        error: (err) => {
          console.error('CSV parsing error:', err);
          alert('Failed to parse CSV: ' + err.message);
        }
      });
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file: ' + (error as Error).message);
    }
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    // Convert transactions to CSV format
    const csvData = transactions.map(t => ({
      'Transaction Type': t.transactionType,
      'Currency': t.currency,
      'Account': t.account,
      'Symbol': t.symbol,
      'Date': t.date,
      'Quantity': t.quantity,
      'Trade Price': t.tradePrice,
      'Commission': t.commission,
      'Exchange Rate': t.exchangeRate
    }));

    // Convert to CSV string
    const csv = Papa.unparse(csvData);
    
    // Create and download the file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSample = () => {
    // Sample CSV data with one row
    const sampleData = [
      {
        'Transaction Type': 'Buy',
        'Currency': 'USD',
        'Account': 'ACC001234',
        'Symbol': 'AAPL',
        'Date': '2024-01-15',
        'Quantity': 100,
        'Trade Price': 150.25,
        'Commission': 9.99,
        'Exchange Rate': 1.0000
      }
    ];

    // Convert to CSV string
    const csv = Papa.unparse(sampleData);
    
    // Create and download the file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dividend functions
  const fetchDividends = async () => {
    try {
      const { data, error } = await supabase
        .from('dividends')
        .select('*');
      
      if (error) throw error;
      
      setDividends(data || []);
    } catch (error) {
      console.error('Error fetching dividends:', error);
      alert('Failed to fetch dividends');
    }
  };

  const handleDividendEdit = (dividend: Dividend) => {
    setEditingDividend({ ...dividend });
    setIsDividendEditDialogOpen(true);
  };

  const handleDividendSave = async (dividend: Dividend) => {
    try {
      if (dividend.id.startsWith('temp_')) {
        // New dividend
        const { id, ...dividendData } = dividend;
        const { data, error } = await supabase
          .from('dividends')
          .insert([dividendData])
          .select()
          .single();

        if (error) throw error;
        
        setDividends(prev => [...prev, data]);
      } else {
        // Update existing dividend
        const { error } = await supabase
          .from('dividends')
          .update(dividend)
          .eq('id', dividend.id);

        if (error) throw error;

        setDividends(prev => 
          prev.map(d => d.id === dividend.id ? dividend : d)
        );
      }

      setIsDividendEditDialogOpen(false);
      setEditingDividend(null);
    } catch (error) {
      console.error('Error saving dividend:', error);
      alert('Failed to save dividend');
    }
  };

  const handleDividendDelete = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('dividends')
        .delete()
        .in('id', ids);

      if (error) throw error;

      setDividends(prev => prev.filter(d => !ids.includes(d.id)));
    } catch (error) {
      console.error('Error deleting dividends:', error);
      alert('Failed to delete dividends');
    }
  };

  const handleDividendAddNew = () => {
    const newDividend: Dividend = {
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
    };
    setEditingDividend(newDividend);
    setIsDividendEditDialogOpen(true);
  };

  const handleDividendUpload = async (uploadedDividends: Dividend[]) => {
    try {
      const existingKeys = new Set(dividends.map(getDividendKey));
      const newDividends: Dividend[] = [];
      let duplicates = 0;

      uploadedDividends.forEach(dividend => {
        const key = getDividendKey(dividend);
        if (existingKeys.has(key)) {
          duplicates++;
        } else {
          existingKeys.add(key);
          newDividends.push(dividend);
        }
      });

      if (newDividends.length > 0) {
        const { data, error } = await supabase
          .from('dividends')
          .insert(newDividends.map(({ id, ...d }) => d))
          .select();

        if (error) throw error;

        setDividends(prev => [...prev, ...(data || [])]);
      }

      // Save upload log
      const logEntry = {
        id: `dividend_log_${Date.now()}`,
        fileName: 'dividend_upload.csv',
        uploadDate: new Date().toISOString(),
        newDividends: newDividends.length,
        totalDividends: uploadedDividends.length,
        duplicates: duplicates
      };

      setDividendUploadLogs(prev => [logEntry, ...prev.slice(0, 9)]);

      alert(`Successfully imported ${newDividends.length} dividends. ${duplicates} duplicates skipped.`);
    } catch (error) {
      console.error('Error processing dividend upload:', error);
      alert('Failed to process dividend upload');
    }
  };

  const handleDividendExport = () => {
    const csvData = dividends.map(d => ({
      'Transaction Type': d.transactionType,
      'Currency': d.currency,
      'Account': d.account,
      'Symbol': d.symbol,
      'Date': formatDividendDate(d.date),
      'Amount': d.amount
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `dividends_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDividendDownloadSample = () => {
    const sampleData = [
      {
        'Transaction Type': 'Dividends',
        'Currency': 'USD',
        'Account': 'ACC001234',
        'Symbol': 'AAPL',
        'Date': '2024-01-15',
        'Amount': 150.25
      }
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_dividends.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDividendClearFilters = () => {
    setDividendSearchTerm('');
    setDividendStartDate(undefined);
    setDividendEndDate(undefined);
    setDividendStatusFilter('all');
  };

  // Filter functions
  const filteredTransactions = transactions.filter(transaction => {
    // Search term filter
    const matchesSearch = 
      transaction.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.currency.toLowerCase().includes(searchTerm.toLowerCase());

    // Transaction type filter
    const matchesFilter = transactionTypeFilter === 'all' || transaction.transactionType === transactionTypeFilter;

    // Date range filter
    const transactionDate = new Date(transaction.date);
    const matchesDateRange = (!startDate || transactionDate >= startDate) &&
                           (!endDate || transactionDate <= endDate);

    // Status filter
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

    return matchesSearch && matchesFilter && matchesDateRange && matchesStatus;
  });

  // Filtered dividends based on search and date range
  const filteredDividends = useMemo(() => {
    return dividends.filter((dividend) => {
      // Search filter
      const searchMatch = !dividendSearchTerm || 
        dividend.account.toLowerCase().includes(dividendSearchTerm.toLowerCase()) ||
        dividend.symbol.toLowerCase().includes(dividendSearchTerm.toLowerCase()) ||
        dividend.currency.toLowerCase().includes(dividendSearchTerm.toLowerCase());

      // Date range filter
      const dateMatch = (!dividendStartDate || dividend.date >= dividendStartDate) &&
                       (!dividendEndDate || dividend.date <= dividendEndDate);

      // Status filter
      const statusMatch = dividendStatusFilter === 'all' || 
                         dividend.status === dividendStatusFilter;

      return searchMatch && dateMatch && statusMatch;
    });
  }, [dividends, dividendSearchTerm, dividendStartDate, dividendEndDate, dividendStatusFilter]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate(undefined);
    setEndDate(undefined);
    setStatusFilter('all');
    setTransactionTypeFilter('all'); // Add this line
  };

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Transaction Management</h1>
            <p className="text-muted-foreground">
              View, edit, and manage all client transactions and dividends
            </p>
          </div>
          {activeTab === 'transactions' && (
            <div className="flex gap-2">
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CSV
                  </Button>
                </DialogTrigger>
              </Dialog>
              <UploadDialog
                isOpen={isUploadDialogOpen}
                onClose={() => setIsUploadDialogOpen(false)}
                onUpload={handleFileUpload}
              />
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={handleDownloadSample}>
                <Download className="w-4 h-4 mr-2" />
                Download Sample CSV
              </Button>
            </div>
          )}
          {activeTab === 'dividends' && (
            <div className="flex gap-2">
              <Button onClick={() => setIsDividendUploadDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
              <Button variant="outline" onClick={handleDividendExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={handleDividendDownloadSample}>
                <Download className="w-4 h-4 mr-2" />
                Download Sample CSV
              </Button>
            </div>
          )}
        </div>
        
        <Tabs defaultValue="transactions" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="dividends">Dividends</TabsTrigger>
            <TabsTrigger value="logs">Upload Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="space-y-6">
            <TransactionFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              transactionTypeFilter={transactionTypeFilter}
              onTransactionTypeFilterChange={setTransactionTypeFilter}
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onClearFilters={handleClearFilters}
            />
            <TransactionTable
              transactions={filteredTransactions}
              onAddNew={handleAddNew}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="dividends" className="space-y-6">
            <DividendFilters
              searchTerm={dividendSearchTerm}
              onSearchChange={setDividendSearchTerm}
              startDate={dividendStartDate}
              endDate={dividendEndDate}
              onStartDateChange={setDividendStartDate}
              onEndDateChange={setDividendEndDate}
              onClearFilters={handleDividendClearFilters}
              statusFilter={dividendStatusFilter}
              onStatusFilterChange={setDividendStatusFilter}
            />
            <DividendTable
              dividends={filteredDividends}
              onAddNew={handleDividendAddNew}
              onEdit={handleDividendEdit}
              onDelete={handleDividendDelete}
            />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Recent Upload Activity
                </CardTitle>
                <CardDescription>
                  Track your recent CSV uploads and processing results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadLogs.length === 0 && dividendUploadLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No upload activity yet. Upload a CSV file to see logs here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Transaction Logs */}
                    {uploadLogs.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Transaction Uploads</h3>
                        {uploadLogs.map((log) => (
                          <div key={log.id} className="border rounded-lg p-4 mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{log.fileName}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {log.uploadDate}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-green-600">{log.newTransactions}</span> new transactions
                              </div>
                              <div>
                                <span className="font-medium text-blue-600">{log.totalTransactions}</span> total processed
                              </div>
                              <div>
                                <span className="font-medium text-orange-600">{log.duplicates}</span> duplicates skipped
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dividend Logs */}
                    {dividendUploadLogs.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Dividend Uploads</h3>
                        {dividendUploadLogs.map((log) => (
                          <div key={log.id} className="border rounded-lg p-4 mb-2">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{log.fileName}</Badge>
                                <span className="text-sm text-muted-foreground">
                                  {log.uploadDate}
                                </span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-green-600">{log.newDividends}</span> new dividends
                              </div>
                              <div>
                                <span className="font-medium text-blue-600">{log.totalDividends}</span> total processed
                              </div>
                              <div>
                                <span className="font-medium text-orange-600">{log.duplicates}</span> duplicates skipped
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Transaction Dialog */}
        <TransactionDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          editingTransaction={editingTransaction}
          setEditingTransaction={setEditingTransaction}
          onSave={handleSave}
        />

        {/* Dividend Dialog */}
        <DividendDialog
          isOpen={isDividendEditDialogOpen}
          onClose={() => setIsDividendEditDialogOpen(false)}
          editingDividend={editingDividend}
          onSave={handleDividendSave}
        />

        {/* Dividend Upload Dialog */}
        <DividendUploadDialog
          isOpen={isDividendUploadDialogOpen}
          onClose={() => setIsDividendUploadDialogOpen(false)}
          onUpload={handleDividendUpload}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminTransactions;
