import React, { useState } from 'react';
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
import type { Transaction } from '@/types/transaction';
import Papa from 'papaparse';

const getTransactionKey = (t: Partial<Transaction>) =>
  [t.date, t.account, t.transactionType, t.symbol, t.quantity, t.price].join('|');

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accountMappings, setAccountMappings] = useState<any[]>([]); // Local state for account management
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadLogs, setUploadLogs] = useState<Array<{
    id: string;
    fileName: string;
    uploadDate: string;
    newTransactions: number;
    totalTransactions: number;
    duplicates: number;
  }>>([]);
  const [activeTab, setActiveTab] = useState('transactions');

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction({ ...transaction });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (editingTransaction) {
      setTransactions(transactions.map(t =>
        t.id === editingTransaction.id ? editingTransaction : t
      ));
      setIsEditDialogOpen(false);
      setEditingTransaction(null);
    }
  };

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleAddNew = () => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      account: '',
      description: '',
      transactionType: 'Buy',
      symbol: '',
      quantity: 0,
      price: 0,
      grossAmount: 0,
      commission: 0,
      netAmount: 0,
      exchangeRate: 1.0000
    };
    setEditingTransaction(newTransaction);
    setIsEditDialogOpen(true);
  };



  // Handles CSV file upload and parsing, prevents duplicates
  const handleFileUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data as any[];
        // Build a set of existing transaction keys
        const existingKeys = new Set(transactions.map(getTransactionKey));
        const newTransactions: Transaction[] = parsedData.map((row, idx) => ({
          id: Date.now().toString() + '-' + idx,
          transactionType: row['Transaction Type'] || '',
          account: row['Account'] || '',
          symbol: row['Symbol'] || '',
          date: row['Date'] || '',
          quantity: row['Quantity'] ? parseFloat(row['Quantity']) : null,
          price: row['Trade Price'] ? parseFloat(row['Trade Price']) : null, // Standardized to 'Trade Price'
          grossAmount: 0, // You may want to calculate this or add a column
          commission: row['Commission'] ? parseFloat(row['Commission']) : (row['Comm/Fee'] ? parseFloat(row['Comm/Fee']) : null), // Updated header
          netAmount: 0, // You may want to calculate this or add a column
          exchangeRate: row['Exchange Rate'] ? parseFloat(row['Exchange Rate']) : 1.0,
          description: '', // Not present in CSV, can be left blank or mapped if available
        }));
        // Filter out duplicates
        const uniqueNewTransactions = newTransactions.filter(t => !existingKeys.has(getTransactionKey(t)));
        const duplicates = newTransactions.length - uniqueNewTransactions.length;
        
        // Add to transactions
        setTransactions(prev => [...prev, ...uniqueNewTransactions]);
        
        // Add upload log
        const uploadLog = {
          id: Date.now().toString(),
          fileName: file.name,
          uploadDate: new Date().toLocaleString(),
          newTransactions: uniqueNewTransactions.length,
          totalTransactions: parsedData.length,
          duplicates: duplicates
        };
        setUploadLogs(prev => [uploadLog, ...prev.slice(0, 4)]); // Keep last 5 logs
        
        setIsUploadDialogOpen(false);
      },
      error: (err) => {
        alert('Failed to parse CSV: ' + err.message);
      }
    });
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    // Convert transactions to CSV format
    const csvData = transactions.map(t => ({
      'Date': t.date,
      'Account': t.account,
      'Transaction Type': t.transactionType,
      'Symbol': t.symbol,
      'Quantity': t.quantity,
      'Trade Price': t.price,
      'Commission': t.commission,
      'Exchange Rate': t.exchangeRate,
      'Description': t.description
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

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.transactionType === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Transaction Management</h1>
            <p className="text-muted-foreground">
              View, edit, and manage all client transactions
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
            </div>
          )}
        </div>
        <Tabs defaultValue="transactions" className="space-y-6" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="logs">Upload Logs</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions" className="space-y-6">
            <TransactionFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
            />
            <TransactionTable
              transactions={filteredTransactions}
              accountMappings={[]}
              onAddNew={handleAddNew}
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
                  Track your recent CSV uploads and transaction processing results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No upload activity yet. Upload a CSV file to see logs here.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploadLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-4">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <TransactionDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          editingTransaction={editingTransaction}
          setEditingTransaction={setEditingTransaction}
          onSave={handleSave}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminTransactions;
