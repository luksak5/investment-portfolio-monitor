import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { AdvisorService } from '@/lib/advisorService';
import { AdvisorWithClients, AdvisorFormData } from '@/types/advisor';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';

interface AdvisorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAdvisor: AdvisorWithClients | null;
  onSuccess: () => void;
}

const AdvisorDialog: React.FC<AdvisorDialogProps> = ({
  open,
  onOpenChange,
  editingAdvisor,
  onSuccess
}) => {
  const { toast } = useToast();
  const [availableClients, setAvailableClients] = useState<Array<{ account: string; clientName: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AdvisorFormData>({
    advisor_id: '',
    advisor_name: '',
    email: '',
    phone: '',
    assigned_clients: [],
    status: 'active'
  });

  // Load available clients when dialog opens
  useEffect(() => {
    if (open) {
      loadAvailableClients();
    }
  }, [open]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({
        advisor_id: '',
        advisor_name: '',
        email: '',
        phone: '',
        assigned_clients: [],
        status: 'active'
      });
    }
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (editingAdvisor && open) {
      setFormData({
        advisor_id: editingAdvisor.advisor_id,
        advisor_name: editingAdvisor.advisor_name,
        email: editingAdvisor.email,
        phone: editingAdvisor.phone || '',
        assigned_clients: editingAdvisor.assigned_clients.map(client => client.client_account),
        status: editingAdvisor.status
      });
    }
  }, [editingAdvisor, open]);

  const loadAvailableClients = async () => {
    try {
      // Use the improved service method that handles editing case
      const clients = await AdvisorService.getAvailableClients(editingAdvisor?.advisor_id);
      setAvailableClients(clients);
    } catch (error) {
      console.error('Error loading available clients:', error);
      toast({
        title: "Error",
        description: "Failed to load available clients",
        variant: "destructive",
      });
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof AdvisorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle client selection
  const handleClientToggle = (clientId: string, isChecked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assigned_clients: isChecked 
        ? [...prev.assigned_clients, clientId]
        : prev.assigned_clients.filter(id => id !== clientId)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.advisor_id.trim() || !formData.advisor_name.trim() || !formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (editingAdvisor) {
        // Update existing advisor
        await AdvisorService.updateAdvisor(editingAdvisor.advisor_id, formData);
        toast({
          title: "Success",
          description: "Advisor updated successfully",
        });
      } else {
        // Add new advisor
        await AdvisorService.createAdvisor(formData);
        toast({
          title: "Success",
          description: "Advisor created successfully",
        });
      }

      // Close dialog and refresh data
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Error saving advisor:', error);
      toast({
        title: "Error",
        description: "Failed to save advisor",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Close dialog
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingAdvisor ? 'Edit Advisor' : 'Add New Advisor'}
          </DialogTitle>
          <DialogDescription>
            {editingAdvisor 
              ? 'Modify advisor details and client assignments'
              : 'Create a new advisor account and assign clients'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="advisor_id">Advisor ID *</Label>
              <Input
                id="advisor_id"
                value={formData.advisor_id}
                onChange={(e) => handleInputChange('advisor_id', e.target.value)}
                placeholder="Enter advisor ID"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="advisor_name">Advisor Name *</Label>
              <Input
                id="advisor_name"
                value={formData.advisor_name}
                onChange={(e) => handleInputChange('advisor_name', e.target.value)}
                placeholder="Enter advisor name"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email ID *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
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

          {/* Client Assignment */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">Assign Clients</Label>
              <Badge variant="secondary">
                {formData.assigned_clients.length} selected
              </Badge>
            </div>
            
                              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-3">
                      {availableClients.map((client) => {
                        const isSelected = formData.assigned_clients.includes(client.account);
                        return (
                          <div key={client.account} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                            <Checkbox
                              id={client.account}
                              checked={isSelected}
                              onCheckedChange={(checked) => handleClientToggle(client.account, checked as boolean)}
                            />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <Label htmlFor={client.account} className="font-medium cursor-pointer">
                                  {client.clientName}
                                </Label>
                                <span className="text-sm text-gray-500">
                                  {client.account}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Account: {client.account}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Clients Summary */}
                  {formData.assigned_clients.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Selected Clients:</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.assigned_clients.map((clientAccount) => {
                          const client = availableClients.find(c => c.account === clientAccount);
                          return client ? (
                            <Badge key={clientAccount} variant="outline" className="flex items-center gap-1">
                              {client.clientName}
                              <X 
                                className="w-3 h-3 cursor-pointer" 
                                onClick={() => handleClientToggle(clientAccount, false)}
                              />
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (editingAdvisor ? 'Update Advisor' : 'Create Advisor')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdvisorDialog; 