import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import { Companies, Contacts, Tickets, Projects, Tasks, Opportunities, Resources, CompanyAttachments, TicketAttachments, ProjectAttachments, TaskAttachments, ResourceAttachments, OpportunityAttachments, CompanyNotes, TicketNotes, ProjectNotes, TaskNotes, CompanyNoteAttachments, TicketNoteAttachments, ProjectNoteAttachments, TaskNoteAttachments, TicketCategories, TicketCategoryFieldDefaults, TicketAdditionalConfigurationItems, TicketAdditionalContacts, TicketChangeRequestApprovals, TicketCharges, TicketChecklistItems, TicketChecklistLibraries, TicketHistory, TicketRmaCredits, TicketSecondaryResources, TicketTagAssociations, TaskPredecessors, TaskSecondaryResources, ProjectCharges, CompanyAlerts, CompanyCategories, CompanyLocations, CompanySiteConfigurations, CompanyTeams, CompanyToDos, ContactBillingProductAssociations, ContactGroups, ContactGroupContacts } from '../../entities';
/**
 * CoreClient handles the primary business entities:
 * - Companies (Organizations)
 * - Contacts (Individuals within companies)
 * - Tickets (Service tickets and support requests)
 * - Projects (Client projects and work orders)
 * - Tasks (Project tasks and work items)
 * - Opportunities (Sales opportunities and pipeline)
 * - Resources (Human resources and staff members)
 *
 * Plus all related attachments, notes, and extended functionality.
 */
export declare class CoreClient extends BaseSubClient {
    readonly companies: Companies;
    readonly contacts: Contacts;
    readonly tickets: Tickets;
    readonly projects: Projects;
    readonly tasks: Tasks;
    readonly opportunities: Opportunities;
    readonly resources: Resources;
    readonly companyAttachments: CompanyAttachments;
    readonly ticketAttachments: TicketAttachments;
    readonly projectAttachments: ProjectAttachments;
    readonly taskAttachments: TaskAttachments;
    readonly resourceAttachments: ResourceAttachments;
    readonly opportunityAttachments: OpportunityAttachments;
    readonly companyNotes: CompanyNotes;
    readonly ticketNotes: TicketNotes;
    readonly projectNotes: ProjectNotes;
    readonly taskNotes: TaskNotes;
    readonly companyNoteAttachments: CompanyNoteAttachments;
    readonly ticketNoteAttachments: TicketNoteAttachments;
    readonly projectNoteAttachments: ProjectNoteAttachments;
    readonly taskNoteAttachments: TaskNoteAttachments;
    readonly ticketCategories: TicketCategories;
    readonly ticketCategoryFieldDefaults: TicketCategoryFieldDefaults;
    readonly ticketAdditionalConfigurationItems: TicketAdditionalConfigurationItems;
    readonly ticketAdditionalContacts: TicketAdditionalContacts;
    readonly ticketChangeRequestApprovals: TicketChangeRequestApprovals;
    readonly ticketCharges: TicketCharges;
    readonly ticketChecklistItems: TicketChecklistItems;
    readonly ticketChecklistLibraries: TicketChecklistLibraries;
    readonly ticketHistory: TicketHistory;
    readonly ticketRmaCredits: TicketRmaCredits;
    readonly ticketSecondaryResources: TicketSecondaryResources;
    readonly ticketTagAssociations: TicketTagAssociations;
    readonly taskPredecessors: TaskPredecessors;
    readonly taskSecondaryResources: TaskSecondaryResources;
    readonly projectCharges: ProjectCharges;
    readonly companyAlerts: CompanyAlerts;
    readonly companyCategories: CompanyCategories;
    readonly companyLocations: CompanyLocations;
    readonly companySiteConfigurations: CompanySiteConfigurations;
    readonly companyTeams: CompanyTeams;
    readonly companyToDos: CompanyToDos;
    readonly contactBillingProductAssociations: ContactBillingProductAssociations;
    readonly contactGroups: ContactGroups;
    readonly contactGroupContacts: ContactGroupContacts;
    constructor(axios: AxiosInstance, logger: winston.Logger);
    getName(): string;
    protected doConnectionTest(): Promise<void>;
    /**
     * Get active companies
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active companies
     */
    getActiveCompanies(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/companies").ICompanies[]>>;
    /**
     * Get active tickets
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active tickets
     */
    getActiveTickets(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/tickets").ITickets[]>>;
    /**
     * Get active projects
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active projects
     */
    getActiveProjects(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/projects").IProjects[]>>;
    /**
     * Get active tasks
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active tasks
     */
    getActiveTasks(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/tasks").ITasks[]>>;
    /**
     * Get active opportunities
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active opportunities
     */
    getActiveOpportunities(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/opportunities").IOpportunities[]>>;
    /**
     * Get tickets by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company tickets
     */
    getTicketsByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/tickets").ITickets[]>>;
    /**
     * Get projects by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company projects
     */
    getProjectsByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/projects").IProjects[]>>;
    /**
     * Get contacts by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company contacts
     */
    getContactsByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/contacts").IContacts[]>>;
    /**
     * Get opportunities by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company opportunities
     */
    getOpportunitiesByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/opportunities").IOpportunities[]>>;
    /**
     * Get recent tickets created within specified days
     * @param days - Number of days to look back (default: 7)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent tickets
     */
    getRecentTickets(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/tickets").ITickets[]>>;
    /**
     * Get recent projects created within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent projects
     */
    getRecentProjects(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/projects").IProjects[]>>;
    /**
     * Get recent tasks created within specified days
     * @param days - Number of days to look back (default: 14)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent tasks
     */
    getRecentTasks(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/tasks").ITasks[]>>;
    /**
     * Search companies by name or other criteria
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['companyName'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching companies
     */
    searchCompanies(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/companies").ICompanies[]>>;
    /**
     * Search tickets by title, description or ticket number
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['title', 'description'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching tickets
     */
    searchTickets(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/tickets").ITickets[]>>;
    /**
     * Search contacts by name or email
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['firstName', 'lastName', 'emailAddress'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching contacts
     */
    searchContacts(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/contacts").IContacts[]>>;
    /**
     * Search projects by name or description
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['projectName', 'description'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching projects
     */
    searchProjects(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/projects").IProjects[]>>;
}
//# sourceMappingURL=CoreClient.d.ts.map