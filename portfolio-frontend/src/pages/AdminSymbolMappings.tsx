import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Search, Edit, Trash2, Download, Upload } from 'lucide-react';
import { SymbolMapping, CreateSymbolMappingRequest, UpdateSymbolMappingRequest } from '@/types/symbolMapping';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

export default function AdminSymbolMappings() {
  const [symbolMappings, setSymbolMappings] = useState<SymbolMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<SymbolMapping | null>(null);
  const [formData, setFormData] = useState<CreateSymbolMappingRequest>({
    ibkr_symbol: '',
    yahoo_symbol: '',
    security_name: '',
    exchange: '',
    asset_type: '',
    is_active: true
  });
  const [otherAssetType, setOtherAssetType] = useState('');
  const { toast } = useToast();

  // Load symbol mappings
  const loadSymbolMappings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('symbol_mappings')
        .select('*')
        .order('created_at', { ascending: false });

             if (searchTerm) {
         query = query.or(`ibkr_symbol.ilike.%${searchTerm}%,yahoo_symbol.ilike.%${searchTerm}%,security_name.ilike.%${searchTerm}%,asset_type.ilike.%${searchTerm}%`);
       }

      const { data, error } = await query;

      if (error) throw error;
      setSymbolMappings(data || []);
    } catch (error) {
      console.error('Error loading symbol mappings:', error);
      toast({
        title: "Error",
        description: "Failed to load symbol mappings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSymbolMappings();
  }, [searchTerm]);

  // Test database connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('symbol_mappings')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        toast({
          title: "Error",
          description: `Database connection failed: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('Database connection successful');
        toast({
          title: "Success",
          description: "Database connection working",
        });
      }
    } catch (error) {
      console.error('Test connection error:', error);
    }
  };

  // Create new mapping
  const createMapping = async () => {
    console.log('Creating mapping with data:', formData);
    
    // Validate required fields
    if (!formData.ibkr_symbol.trim()) {
      toast({
        title: "Error",
        description: "IBKR Symbol is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.yahoo_symbol.trim()) {
      toast({
        title: "Error",
        description: "Yahoo Symbol is required",
        variant: "destructive",
      });
      return;
    }

    // Handle asset type - if Other is selected, use the custom value
    const finalAssetType = formData.asset_type === 'Other' && otherAssetType.trim() 
      ? otherAssetType.trim() 
      : formData.asset_type;

    const dataToInsert = {
      ...formData,
      asset_type: finalAssetType
    };

    // Check for duplicate IBKR symbol
    try {
      const { data: existingMapping, error: checkError } = await supabase
        .from('symbol_mappings')
        .select('ibkr_symbol')
        .eq('ibkr_symbol', formData.ibkr_symbol.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking for duplicates:', checkError);
        throw checkError;
      }

      if (existingMapping) {
        toast({
          title: "Error",
          description: `IBKR Symbol "${formData.ibkr_symbol}" already exists`,
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      toast({
        title: "Error",
        description: "Failed to check for duplicates",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Attempting to insert into database...');
      const { data, error } = await supabase
        .from('symbol_mappings')
        .insert([dataToInsert])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Insert successful, data:', data);

      toast({
        title: "Success",
        description: "Symbol mapping created successfully",
      });

      setIsDialogOpen(false);
      resetForm();
      loadSymbolMappings();
    } catch (error) {
      console.error('Error creating symbol mapping:', error);
      toast({
        title: "Error",
        description: "Failed to create symbol mapping",
        variant: "destructive",
      });
    }
  };

    // Update mapping
  const updateMapping = async () => {
    if (!editingMapping) return;

    // Validate required fields
    if (!formData.ibkr_symbol.trim()) {
      toast({
        title: "Error",
        description: "IBKR Symbol is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.yahoo_symbol.trim()) {
      toast({
        title: "Error",
        description: "Yahoo Symbol is required",
        variant: "destructive",
      });
      return;
    }

    // Handle asset type - if Other is selected, use the custom value
    const finalAssetType = formData.asset_type === 'Other' && otherAssetType.trim() 
      ? otherAssetType.trim() 
      : formData.asset_type;

    try {
      const { error } = await supabase
        .from('symbol_mappings')
        .update({
          ibkr_symbol: formData.ibkr_symbol,
          yahoo_symbol: formData.yahoo_symbol,
          security_name: formData.security_name,
          exchange: formData.exchange,
          asset_type: finalAssetType,
          is_active: formData.is_active
        })
        .eq('id', editingMapping.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Symbol mapping updated successfully",
      });

      setIsDialogOpen(false);
      resetForm();
      loadSymbolMappings();
    } catch (error) {
      console.error('Error updating symbol mapping:', error);
      toast({
        title: "Error",
        description: "Failed to update symbol mapping",
        variant: "destructive",
      });
    }
  };

  // Delete mapping
  const deleteMapping = async (id: number) => {
    if (!confirm('Are you sure you want to delete this symbol mapping?')) return;

    try {
      const { error } = await supabase
        .from('symbol_mappings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Symbol mapping deleted successfully",
      });

      loadSymbolMappings();
    } catch (error) {
      console.error('Error deleting symbol mapping:', error);
      toast({
        title: "Error",
        description: "Failed to delete symbol mapping",
        variant: "destructive",
      });
    }
  };

  // Toggle active status
  const toggleActive = async (mapping: SymbolMapping) => {
    try {
      const { error } = await supabase
        .from('symbol_mappings')
        .update({ is_active: !mapping.is_active })
        .eq('id', mapping.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Symbol mapping ${mapping.is_active ? 'deactivated' : 'activated'} successfully`,
      });

      loadSymbolMappings();
    } catch (error) {
      console.error('Error toggling mapping status:', error);
      toast({
        title: "Error",
        description: "Failed to update mapping status",
        variant: "destructive",
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      ibkr_symbol: '',
      yahoo_symbol: '',
      security_name: '',
      exchange: '',
      asset_type: '',
      is_active: true
    });
    setOtherAssetType('');
    setEditingMapping(null);
  };

  // Open edit dialog
  const openEditDialog = (mapping: SymbolMapping) => {
    setEditingMapping(mapping);
    const assetType = mapping.asset_type || '';
    setFormData({
      ibkr_symbol: mapping.ibkr_symbol,
      yahoo_symbol: mapping.yahoo_symbol,
      security_name: mapping.security_name || '',
      exchange: mapping.exchange || '',
             asset_type: assetType === 'Other' ? 'Other' : assetType,
      is_active: mapping.is_active
    });
         // If it's a custom asset type (not in our predefined list), set it as other
     if (assetType && !['Equity', 'Debt', 'Gold', 'Real Estate', 'Other'].includes(assetType)) {
       setOtherAssetType(assetType);
       setFormData(prev => ({ ...prev, asset_type: 'Other' }));
     } else {
       setOtherAssetType('');
     }
    setIsDialogOpen(true);
  };

  // Open create dialog
  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Symbol Mappings</h1>
            <p className="text-muted-foreground">
              Manage IBKR to Yahoo Finance symbol mappings
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Mapping
          </Button>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Symbol Mappings</CardTitle>
          <CardDescription>
            Map IBKR terminal symbols to their corresponding Yahoo Finance symbols
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by IBKR symbol, Yahoo symbol, or security name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Upload className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
                             <TableHeader>
                 <TableRow>
                   <TableHead>IBKR Symbol</TableHead>
                   <TableHead>Yahoo Symbol</TableHead>
                   <TableHead>Security Name</TableHead>
                   <TableHead>Exchange</TableHead>
                   <TableHead>Asset Type</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead>Created</TableHead>
                   <TableHead className="text-right">Actions</TableHead>
                 </TableRow>
               </TableHeader>
              <TableBody>
                                 {loading ? (
                   <TableRow>
                     <TableCell colSpan={8} className="text-center py-8">
                       Loading...
                     </TableCell>
                   </TableRow>
                 ) : symbolMappings.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={8} className="text-center py-8">
                       No symbol mappings found
                     </TableCell>
                   </TableRow>
                                 ) : (
                   symbolMappings.map((mapping) => (
                     <TableRow key={mapping.id}>
                       <TableCell className="font-medium">{mapping.ibkr_symbol}</TableCell>
                       <TableCell>{mapping.yahoo_symbol}</TableCell>
                       <TableCell>{mapping.security_name || '-'}</TableCell>
                       <TableCell>{mapping.exchange || '-'}</TableCell>
                       <TableCell>{mapping.asset_type || '-'}</TableCell>
                       <TableCell>
                         <Badge variant={mapping.is_active ? "default" : "secondary"}>
                           {mapping.is_active ? "Active" : "Inactive"}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         {new Date(mapping.created_at).toLocaleDateString()}
                       </TableCell>
                       <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleActive(mapping)}
                          >
                            {mapping.is_active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(mapping)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMapping(mapping.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingMapping ? 'Edit Symbol Mapping' : 'Add Symbol Mapping'}
            </DialogTitle>
            <DialogDescription>
              {editingMapping 
                ? 'Update the symbol mapping details below.'
                : 'Create a new mapping between IBKR and Yahoo Finance symbols.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ibkr_symbol" className="text-right">
                IBKR Symbol
              </Label>
              <Input
                id="ibkr_symbol"
                value={formData.ibkr_symbol}
                onChange={(e) => setFormData({ ...formData, ibkr_symbol: e.target.value })}
                className="col-span-3"
                placeholder="e.g., IB01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="yahoo_symbol" className="text-right">
                Yahoo Symbol
              </Label>
              <Input
                id="yahoo_symbol"
                value={formData.yahoo_symbol}
                onChange={(e) => setFormData({ ...formData, yahoo_symbol: e.target.value })}
                className="col-span-3"
                placeholder="e.g., IB01.L"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="security_name" className="text-right">
                Security Name
              </Label>
              <Input
                id="security_name"
                value={formData.security_name}
                onChange={(e) => setFormData({ ...formData, security_name: e.target.value })}
                className="col-span-3"
                placeholder="e.g., iShares Global Government Bond UCITS ETF"
              />
            </div>
                         <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="exchange" className="text-right">
                 Exchange
               </Label>
               <Select
                 value={formData.exchange}
                 onValueChange={(value) => setFormData({ ...formData, exchange: value })}
               >
                 <SelectTrigger className="col-span-3">
                   <SelectValue placeholder="Select exchange" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="LSE">LSE (London)</SelectItem>
                   <SelectItem value="NASDAQ">NASDAQ</SelectItem>
                   <SelectItem value="NYSE">NYSE</SelectItem>
                   <SelectItem value="TSX">TSX (Toronto)</SelectItem>
                   <SelectItem value="ASX">ASX (Australia)</SelectItem>
                   <SelectItem value="OTHER">Other</SelectItem>
                 </SelectContent>
               </Select>
             </div>
                           <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="asset_type" className="text-right">
                  Asset Type
                </Label>
                <Select
                  value={formData.asset_type}
                  onValueChange={(value) => setFormData({ ...formData, asset_type: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Equity">Equity</SelectItem>
                    <SelectItem value="Debt">Debt</SelectItem>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.asset_type === 'Other' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="other_asset_type" className="text-right">
                    Specify Other
                  </Label>
                  <Input
                    id="other_asset_type"
                    value={otherAssetType}
                    onChange={(e) => setOtherAssetType(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., Commodity, Cryptocurrency, etc."
                  />
                </div>
              )}
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="is_active" className="text-right">
                 Active
               </Label>
               <div className="col-span-3">
                 <Switch
                   id="is_active"
                   checked={formData.is_active}
                   onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                 />
               </div>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editingMapping ? updateMapping : createMapping}>
              {editingMapping ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </DashboardLayout>
  );
} 