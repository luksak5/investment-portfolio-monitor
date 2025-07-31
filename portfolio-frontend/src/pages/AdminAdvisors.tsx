
/**
 * @fileoverview Admin Advisors Management Page Component
 * This component provides a comprehensive interface for managing financial advisors
 * in the portfolio monitoring system. It includes functionality for viewing,
 * creating, editing, and deleting advisors, as well as displaying statistics
 * and managing client assignments.
 * 
 * @author Portfolio Monitor Team
 * @version 1.0.0
 * @since 2024-01-01
 */

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { UserPlus, Search, Mail, Phone, Users, DollarSign, Edit, Trash2 } from 'lucide-react';
import { AdvisorService } from '@/lib/advisorService';
import { AdvisorWithClients } from '@/types/advisor';
import { useToast } from '@/hooks/use-toast';
import AdvisorDialog from '@/components/admin/AdvisorDialog';

/**
 * Main component for managing financial advisors in the admin interface.
 * This component provides a comprehensive dashboard for viewing advisor statistics,
 * managing advisor records, and handling client assignments.
 * 
 * @component AdminAdvisors
 * @description Admin interface for advisor management with CRUD operations
 * 
 * @example
 * ```tsx
 * // Basic usage in a route
 * <Route path="/admin/advisors" element={<AdminAdvisors />} />
 * 
 * // With custom layout wrapper
 * <DashboardLayout>
 *   <AdminAdvisors />
 * </DashboardLayout>
 * ```
 * 
 * @returns {JSX.Element} The rendered advisor management interface
 */
const AdminAdvisors = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState<AdvisorWithClients | null>(null);
  const [advisors, setAdvisors] = useState<AdvisorWithClients[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Loads advisor data from the backend service.
   * Fetches all advisors with their assigned clients and updates the component state.
   * Handles loading states and error notifications.
   * 
   * @async
   * @function loadData
   * @description Fetches advisor data from the backend and updates component state
   * 
   * @example
   * ```typescript
   * // Called on component mount
   * useEffect(() => {
   *   loadData();
   * }, []);
   * 
   * // Called after successful operations
   * await loadData();
   * ```
   * 
   * @throws {Error} When the API call fails or data cannot be loaded
   * @returns {Promise<void>} Resolves when data loading is complete
   */
  const loadData = async () => {
    try {
      setLoading(true);
      const advisorsData = await AdvisorService.getAdvisors();
      setAdvisors(advisorsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load advisor data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filters advisors based on the current search term.
   * Searches across advisor name, email, and advisor ID fields.
   * 
   * @type {AdvisorWithClients[]}
   * @description Filtered list of advisors matching the search criteria
   * 
   * @example
   * ```typescript
   * // When searchTerm is "john"
   * // Returns advisors with "john" in name, email, or ID
   * const filtered = advisors.filter(advisor => 
   *   advisor.advisor_name.toLowerCase().includes("john") ||
   *   advisor.email.toLowerCase().includes("john") ||
   *   advisor.advisor_id.toLowerCase().includes("john")
   * );
   * ```
   */
  // Filter advisors based on search term
  const filteredAdvisors = advisors.filter(advisor =>
    advisor.advisor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    advisor.advisor_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * Calculates aggregated statistics for the advisor dashboard.
   * Provides metrics for total advisors, active advisors, client counts,
   * and average clients per advisor.
   * 
   * @type {Object}
   * @description Aggregated statistics for the advisor management dashboard
   * 
   * @example
   * ```typescript
   * const stats = {
   *   totalAdvisors: 25,
   *   activeAdvisors: 22,
   *   totalClients: 150,
   *   avgClientsPerAdvisor: 6
   * };
   * ```
   */
  // Calculate total stats
  const totalStats = {
    totalAdvisors: advisors.length,
    activeAdvisors: advisors.filter(a => a.status === 'active').length,
    totalClients: advisors.reduce((sum, a) => sum + a.assigned_clients.length, 0),
    avgClientsPerAdvisor: Math.round(advisors.reduce((sum, a) => sum + a.assigned_clients.length, 0) / advisors.length)
  };

  /**
   * Handles opening and closing of the advisor dialog.
   * Resets the editing advisor state when the dialog is closed.
   * 
   * @function handleDialogOpenChange
   * @description Controls dialog visibility and resets editing state
   * 
   * @param {boolean} open - Whether the dialog should be open or closed
   * 
   * @example
   * ```typescript
   * // Open dialog for creating new advisor
   * handleDialogOpenChange(true);
   * 
   * // Close dialog and reset editing state
   * handleDialogOpenChange(false);
   * ```
   */
  // Handle dialog open/close
  const handleDialogOpenChange = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) {
      setEditingAdvisor(null);
    }
  };

  /**
   * Initiates the edit process for a specific advisor.
   * Sets the advisor as the editing target and opens the dialog.
   * 
   * @function handleEditAdvisor
   * @description Opens the advisor dialog in edit mode for the specified advisor
   * 
   * @param {AdvisorWithClients} advisor - The advisor to be edited
   * 
   * @example
   * ```typescript
   * // Edit an existing advisor
   * handleEditAdvisor(selectedAdvisor);
   * ```
   */
  // Handle edit advisor
  const handleEditAdvisor = (advisor: AdvisorWithClients) => {
    setEditingAdvisor(advisor);
    setIsAddDialogOpen(true);
  };

  /**
   * Handles successful completion of advisor operations.
   * Refreshes the advisor data to reflect changes made in the dialog.
   * 
   * @function handleDialogSuccess
   * @description Refreshes data after successful advisor operations
   * 
   * @example
   * ```typescript
   * // Called after successful create/update operations
   * handleDialogSuccess();
   * ```
   */
  // Handle dialog success
  const handleDialogSuccess = () => {
    loadData();
  };

  /**
   * Initiates the edit process for a specific advisor.
   * This is a legacy function maintained for backward compatibility.
   * 
   * @deprecated Use handleEditAdvisor instead for better clarity
   * @function handleEdit
   * @description Legacy function for initiating advisor editing
   * 
   * @param {AdvisorWithClients} advisor - The advisor to be edited
   */
  // Handle edit
  const handleEdit = (advisor: AdvisorWithClients) => {
    setEditingAdvisor(advisor);
  };

  /**
   * Deletes an advisor from the system after user confirmation.
   * Removes the advisor and all their client assignments, then refreshes the data.
   * 
   * @async
   * @function handleDelete
   * @description Deletes an advisor after user confirmation
   * 
   * @param {string} advisorId - The unique identifier of the advisor to delete
   * 
   * @example
   * ```typescript
   * // Delete an advisor with confirmation
   * await handleDelete("ADV001");
   * ```
   * 
   * @throws {Error} When the deletion operation fails
   * @returns {Promise<void>} Resolves when deletion is complete
   */
  // Handle delete
  const handleDelete = async (advisorId: string) => {
    if (window.confirm('Are you sure you want to delete this advisor?')) {
      try {
        await AdvisorService.deleteAdvisor(advisorId);
        toast({
          title: "Success",
          description: "Advisor deleted successfully",
        });
        await loadData();
      } catch (error) {
        console.error('Error deleting advisor:', error);
        toast({
          title: "Error",
          description: "Failed to delete advisor",
          variant: "destructive",
        });
      }
    }
  };



  return (
    <DashboardLayout userRole="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Advisor Management</h1>
            <p className="text-muted-foreground">
              Manage and monitor financial advisors in your organization
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Advisor
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Advisors</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalAdvisors}</div>
              <p className="text-xs text-muted-foreground">
                {totalStats.activeAdvisors} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalClients}</div>
              <p className="text-xs text-muted-foreground">
                Across all advisors
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Clients/Advisor</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.avgClientsPerAdvisor}</div>
              <p className="text-xs text-muted-foreground">
                Average client load
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((totalStats.activeAdvisors / totalStats.totalAdvisors) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Advisor activity rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle>All Advisors</CardTitle>
            <CardDescription>
              View and manage all financial advisors
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading advisors...</p>
                </div>
              </div>
                        ) : (
              <>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search advisors by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Advisor Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Assigned Clients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamps</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                                 {filteredAdvisors.map((advisor) => (
                   <TableRow key={advisor.advisor_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{advisor.advisor_name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {advisor.advisor_id}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="w-3 h-3 mr-1" />
                          {advisor.email}
                        </div>
                        {advisor.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="w-3 h-3 mr-1" />
                            {advisor.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium mb-1">
                          {advisor.assigned_clients.length} clients
                        </div>
                        <div className="space-y-1">
                                                     {advisor.assigned_clients.slice(0, 2).map((client) => (
                             <div key={client.id} className="text-xs text-muted-foreground">
                               {client.client_name} ({client.client_account})
                             </div>
                           ))}
                          {advisor.assigned_clients.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{advisor.assigned_clients.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={advisor.status === 'active' ? 'default' : 'secondary'}
                      >
                        {advisor.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-muted-foreground">
                          Created: {new Date(advisor.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-muted-foreground">
                          Updated: {new Date(advisor.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditAdvisor(advisor)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                                                 <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => handleDelete(advisor.advisor_id)}
                         >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advisor Dialog */}
      <AdvisorDialog
        open={isAddDialogOpen}
        onOpenChange={handleDialogOpenChange}
        editingAdvisor={editingAdvisor}
        onSuccess={handleDialogSuccess}
      />
    </DashboardLayout>
  );
};

export default AdminAdvisors;
