import { supabase } from './supabaseClient';
import { Advisor, AdvisorWithClients, AdvisorFormData, AdvisorStats, ClientAssignment } from '@/types/advisor';

export class AdvisorService {
  // Get all advisors with their assigned clients
  static async getAdvisors(): Promise<AdvisorWithClients[]> {
    try {
      // Get all advisors
      const { data: advisors, error: advisorsError } = await supabase
        .from('advisors')
        .select('*')
        .order('created_at', { ascending: false });

      if (advisorsError) throw advisorsError;

      // Get all client assignments with client details
      const { data: assignments, error: assignmentsError } = await supabase
        .from('advisor_client_assignments')
        .select(`
          *,
          clientManagement:client_account (
            account,
            clientName
          )
        `);

      if (assignmentsError) throw assignmentsError;

      // Map assignments to advisors
      const advisorsWithClients = advisors.map(advisor => {
        const advisorAssignments = assignments.filter(
          assignment => assignment.advisor_id === advisor.advisor_id
        );

        const assignedClients: ClientAssignment[] = advisorAssignments.map(assignment => ({
          id: assignment.id,
          advisor_id: assignment.advisor_id,
          client_account: assignment.client_account,
          client_name: assignment.clientManagement?.clientName || 'Unknown Client',
          assigned_at: assignment.assigned_at
        }));

        return {
          ...advisor,
          assigned_clients: assignedClients
        };
      });

      return advisorsWithClients;
    } catch (error) {
      console.error('Error fetching advisors:', error);
      throw error;
    }
  }

  // Get available clients (not assigned to any advisor)
  static async getAvailableClients(excludeAdvisorId?: string): Promise<Array<{ account: string; clientName: string }>> {
    try {
      // Get all clients from clientManagement table
      const { data: allClients, error: clientsError } = await supabase
        .from('clientManagement')
        .select('account, clientName');

      if (clientsError) throw clientsError;

      // Get all assigned client accounts
      const { data: assignedClients, error: assignmentsError } = await supabase
        .from('advisor_client_assignments')
        .select('client_account, advisor_id');

      if (assignmentsError) throw assignmentsError;

      let assignedClientAccounts: string[];
      
      if (excludeAdvisorId) {
        // When editing, exclude clients assigned to this specific advisor
        assignedClientAccounts = assignedClients
          .filter(assignment => assignment.advisor_id !== excludeAdvisorId)
          .map(assignment => assignment.client_account);
      } else {
        // When creating new advisor, exclude all assigned clients
        assignedClientAccounts = assignedClients.map(assignment => assignment.client_account);
      }

      // Filter out assigned clients
      const availableClients = allClients.filter(
        client => !assignedClientAccounts.includes(client.account)
      );

      return availableClients;
    } catch (error) {
      console.error('Error fetching available clients:', error);
      throw error;
    }
  }

  // Create a new advisor
  static async createAdvisor(formData: AdvisorFormData): Promise<Advisor> {
    try {
      // Insert advisor
      const { data: advisor, error: advisorError } = await supabase
        .from('advisors')
        .insert({
          advisor_id: formData.advisor_id,
          advisor_name: formData.advisor_name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status
        })
        .select()
        .single();

      if (advisorError) throw advisorError;

      // Assign clients if any
      if (formData.assigned_clients.length > 0) {
        const assignments = formData.assigned_clients.map(clientAccount => ({
          advisor_id: advisor.advisor_id,
          client_account: clientAccount
        }));

        const { error: assignmentError } = await supabase
          .from('advisor_client_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      return advisor;
    } catch (error) {
      console.error('Error creating advisor:', error);
      throw error;
    }
  }

  // Update an existing advisor
  static async updateAdvisor(advisorId: string, formData: AdvisorFormData): Promise<Advisor> {
    try {
      // Update advisor details
      const { data: advisor, error: advisorError } = await supabase
        .from('advisors')
        .update({
          advisor_id: formData.advisor_id,
          advisor_name: formData.advisor_name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('advisor_id', advisorId)
        .select()
        .single();

      if (advisorError) throw advisorError;

      // Remove all existing assignments
      const { error: deleteError } = await supabase
        .from('advisor_client_assignments')
        .delete()
        .eq('advisor_id', advisorId);

      if (deleteError) throw deleteError;

      // Add new assignments
      if (formData.assigned_clients.length > 0) {
        const assignments = formData.assigned_clients.map(clientAccount => ({
          advisor_id: advisorId,
          client_account: clientAccount
        }));

        const { error: assignmentError } = await supabase
          .from('advisor_client_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      return advisor;
    } catch (error) {
      console.error('Error updating advisor:', error);
      throw error;
    }
  }

  // Delete an advisor
  static async deleteAdvisor(advisorId: string): Promise<void> {
    try {
      // Delete client assignments first
      const { error: assignmentError } = await supabase
        .from('advisor_client_assignments')
        .delete()
        .eq('advisor_id', advisorId);

      if (assignmentError) throw assignmentError;

      // Delete advisor
      const { error: advisorError } = await supabase
        .from('advisors')
        .delete()
        .eq('advisor_id', advisorId);

      if (advisorError) throw advisorError;
    } catch (error) {
      console.error('Error deleting advisor:', error);
      throw error;
    }
  }

  // Get advisor statistics
  static async getAdvisorStats(): Promise<AdvisorStats> {
    try {
      const advisors = await this.getAdvisors();
      
      const totalAdvisors = advisors.length;
      const activeAdvisors = advisors.filter(a => a.status === 'active').length;
      const totalClients = advisors.reduce((sum, a) => sum + a.assigned_clients.length, 0);
      const avgClientsPerAdvisor = totalAdvisors > 0 ? Math.round(totalClients / totalAdvisors) : 0;

      return {
        total_advisors: totalAdvisors,
        active_advisors: activeAdvisors,
        total_clients: totalClients,
        avg_clients_per_advisor: avgClientsPerAdvisor
      };
    } catch (error) {
      console.error('Error fetching advisor stats:', error);
      throw error;
    }
  }
} 