/**
 * @fileoverview TypeScript interfaces and types for advisor management system.
 * This module defines the data structures used throughout the advisor management
 * functionality, including advisor profiles, client assignments, and form data.
 * 
 * @author Portfolio Monitor Team
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * Represents a financial advisor in the system.
 * This interface defines the core properties of an advisor including
 * their identification, contact information, and status.
 * 
 * @interface Advisor
 * @description Core advisor entity with basic profile information
 * 
 * @example
 * ```typescript
 * const advisor: Advisor = {
 *   advisor_id: "ADV001",
 *   advisor_name: "John Smith",
 *   email: "john.smith@company.com",
 *   phone: "+1-555-0123",
 *   status: "active",
 *   created_at: "2024-01-15T10:30:00Z",
 *   updated_at: "2024-01-20T14:45:00Z"
 * };
 * ```
 */
export interface Advisor {
  /** Unique identifier for the advisor (primary key) */
  advisor_id: string;
  
  /** Full name of the advisor */
  advisor_name: string;
  
  /** Email address for communication */
  email: string;
  
  /** Phone number (optional) */
  phone?: string;
  
  /** Current status of the advisor account */
  status: 'active' | 'inactive';
  
  /** ISO timestamp when the advisor was created */
  created_at: string;
  
  /** ISO timestamp when the advisor was last updated */
  updated_at: string;
}

/**
 * Extends the base Advisor interface to include assigned clients.
 * This interface is used when fetching advisor data that includes
 * their client relationships.
 * 
 * @interface AdvisorWithClients
 * @extends {Advisor}
 * @description Advisor entity with associated client assignments
 * 
 * @example
 * ```typescript
 * const advisorWithClients: AdvisorWithClients = {
 *   advisor_id: "ADV001",
 *   advisor_name: "John Smith",
 *   email: "john.smith@company.com",
 *   phone: "+1-555-0123",
 *   status: "active",
 *   created_at: "2024-01-15T10:30:00Z",
 *   updated_at: "2024-01-20T14:45:00Z",
 *   assigned_clients: [
 *     {
 *       id: "assign_001",
 *       advisor_id: "ADV001",
 *       client_account: "ACC123",
 *       client_name: "Alice Johnson",
 *       assigned_at: "2024-01-16T09:00:00Z"
 *     }
 *   ]
 * };
 * ```
 */
export interface AdvisorWithClients extends Advisor {
  /** Array of client assignments for this advisor */
  assigned_clients: ClientAssignment[];
}

/**
 * Represents a client assignment to an advisor.
 * This interface defines the relationship between an advisor
 * and their assigned clients.
 * 
 * @interface ClientAssignment
 * @description Client assignment relationship entity
 * 
 * @example
 * ```typescript
 * const assignment: ClientAssignment = {
 *   id: "assign_001",
 *   advisor_id: "ADV001",
 *   client_account: "ACC123",
 *   client_name: "Alice Johnson",
 *   assigned_at: "2024-01-16T09:00:00Z"
 * };
 * ```
 */
export interface ClientAssignment {
  /** Unique identifier for the assignment record */
  id: string;
  
  /** Reference to the advisor this client is assigned to */
  advisor_id: string;
  
  /** Client account number (foreign key to clientManagement table) */
  client_account: string;
  
  /** Name of the assigned client */
  client_name: string;
  
  /** ISO timestamp when the assignment was created */
  assigned_at: string;
}

/**
 * Represents a client from the clientManagement table.
 * This interface is used when fetching available clients
 * for assignment to advisors.
 * 
 * @interface Client
 * @description Client entity from clientManagement table
 * 
 * @example
 * ```typescript
 * const client: Client = {
 *   account: "ACC123",
 *   clientName: "Alice Johnson"
 * };
 * ```
 */
export interface Client {
  /** Client account number (primary key in clientManagement table) */
  account: string;
  
  /** Full name of the client */
  clientName: string;
}

/**
 * Form data structure for creating or updating advisors.
 * This interface is used in the advisor dialog forms and
 * includes all fields that can be modified by users.
 * 
 * @interface AdvisorFormData
 * @description Form data for advisor creation and updates
 * 
 * @example
 * ```typescript
 * const formData: AdvisorFormData = {
 *   advisor_id: "ADV001",
 *   advisor_name: "John Smith",
 *   email: "john.smith@company.com",
 *   phone: "+1-555-0123",
 *   assigned_clients: ["ACC123", "ACC456"],
 *   status: "active"
 * };
 * ```
 */
export interface AdvisorFormData {
  /** Unique identifier for the advisor */
  advisor_id: string;
  
  /** Full name of the advisor */
  advisor_name: string;
  
  /** Email address for communication */
  email: string;
  
  /** Phone number */
  phone: string;
  
  /** Array of client account numbers to assign to this advisor */
  assigned_clients: string[];
  
  /** Current status of the advisor account */
  status: 'active' | 'inactive';
}

/**
 * Statistical data about advisors in the system.
 * This interface provides aggregated metrics for dashboard
 * displays and reporting.
 * 
 * @interface AdvisorStats
 * @description Aggregated statistics for advisor management
 * 
 * @example
 * ```typescript
 * const stats: AdvisorStats = {
 *   total_advisors: 25,
 *   active_advisors: 22,
 *   total_clients: 150,
 *   avg_clients_per_advisor: 6
 * };
 * ```
 */
export interface AdvisorStats {
  /** Total number of advisors in the system */
  total_advisors: number;
  
  /** Number of advisors with active status */
  active_advisors: number;
  
  /** Total number of clients assigned across all advisors */
  total_clients: number;
  
  /** Average number of clients per advisor (rounded) */
  avg_clients_per_advisor: number;
} 