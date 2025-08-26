import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import {
  Companies,
  Contacts,
  Tickets,
  Projects,
  Tasks,
  Opportunities,
  Resources,
  // Core attachments
  CompanyAttachments,
  TicketAttachments,
  ProjectAttachments,
  TaskAttachments,
  ResourceAttachments,
  OpportunityAttachments,
  // Core notes
  CompanyNotes,
  TicketNotes,
  ProjectNotes,
  TaskNotes,
  CompanyNoteAttachments,
  TicketNoteAttachments,
  ProjectNoteAttachments,
  TaskNoteAttachments,
  // Extended ticket entities
  TicketCategories,
  TicketCategoryFieldDefaults,
  TicketAdditionalConfigurationItems,
  TicketAdditionalContacts,
  TicketChangeRequestApprovals,
  TicketCharges,
  TicketChecklistItems,
  TicketChecklistLibraries,
  TicketHistory,
  TicketRmaCredits,
  TicketSecondaryResources,
  TicketTagAssociations,
  // Extended task entities
  TaskPredecessors,
  TaskSecondaryResources,
  // Extended project entities
  ProjectCharges,
  // Company extended entities
  CompanyAlerts,
  CompanyCategories,
  CompanyLocations,
  CompanySiteConfigurations,
  CompanyTeams,
  CompanyToDos,
  // Contact extended entities
  ContactBillingProductAssociations,
  ContactGroups,
  ContactGroupContacts,
} from '../../entities';

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
export class CoreClient extends BaseSubClient {
  // Core business entities
  public readonly companies: Companies;
  public readonly contacts: Contacts;
  public readonly tickets: Tickets;
  public readonly projects: Projects;
  public readonly tasks: Tasks;
  public readonly opportunities: Opportunities;
  public readonly resources: Resources;

  // Core attachments
  public readonly companyAttachments: CompanyAttachments;
  public readonly ticketAttachments: TicketAttachments;
  public readonly projectAttachments: ProjectAttachments;
  public readonly taskAttachments: TaskAttachments;
  public readonly resourceAttachments: ResourceAttachments;
  public readonly opportunityAttachments: OpportunityAttachments;

  // Core notes
  public readonly companyNotes: CompanyNotes;
  public readonly ticketNotes: TicketNotes;
  public readonly projectNotes: ProjectNotes;
  public readonly taskNotes: TaskNotes;
  public readonly companyNoteAttachments: CompanyNoteAttachments;
  public readonly ticketNoteAttachments: TicketNoteAttachments;
  public readonly projectNoteAttachments: ProjectNoteAttachments;
  public readonly taskNoteAttachments: TaskNoteAttachments;

  // Extended ticket entities
  public readonly ticketCategories: TicketCategories;
  public readonly ticketCategoryFieldDefaults: TicketCategoryFieldDefaults;
  public readonly ticketAdditionalConfigurationItems: TicketAdditionalConfigurationItems;
  public readonly ticketAdditionalContacts: TicketAdditionalContacts;
  public readonly ticketChangeRequestApprovals: TicketChangeRequestApprovals;
  public readonly ticketCharges: TicketCharges;
  public readonly ticketChecklistItems: TicketChecklistItems;
  public readonly ticketChecklistLibraries: TicketChecklistLibraries;
  public readonly ticketHistory: TicketHistory;
  public readonly ticketRmaCredits: TicketRmaCredits;
  public readonly ticketSecondaryResources: TicketSecondaryResources;
  public readonly ticketTagAssociations: TicketTagAssociations;

  // Extended task entities
  public readonly taskPredecessors: TaskPredecessors;
  public readonly taskSecondaryResources: TaskSecondaryResources;

  // Extended project entities
  public readonly projectCharges: ProjectCharges;

  // Extended company entities
  public readonly companyAlerts: CompanyAlerts;
  public readonly companyCategories: CompanyCategories;
  public readonly companyLocations: CompanyLocations;
  public readonly companySiteConfigurations: CompanySiteConfigurations;
  public readonly companyTeams: CompanyTeams;
  public readonly companyToDos: CompanyToDos;

  // Extended contact entities
  public readonly contactBillingProductAssociations: ContactBillingProductAssociations;
  public readonly contactGroups: ContactGroups;
  public readonly contactGroupContacts: ContactGroupContacts;

  constructor(axios: AxiosInstance, logger: winston.Logger) {
    super(axios, logger, 'CoreClient');

    // Initialize all core entities
    this.companies = new Companies(this.axios, this.logger);
    this.contacts = new Contacts(this.axios, this.logger);
    this.tickets = new Tickets(this.axios, this.logger);
    this.projects = new Projects(this.axios, this.logger);
    this.tasks = new Tasks(this.axios, this.logger);
    this.opportunities = new Opportunities(this.axios, this.logger);
    this.resources = new Resources(this.axios, this.logger);

    // Core attachments
    this.companyAttachments = new CompanyAttachments(this.axios, this.logger);
    this.ticketAttachments = new TicketAttachments(this.axios, this.logger);
    this.projectAttachments = new ProjectAttachments(this.axios, this.logger);
    this.taskAttachments = new TaskAttachments(this.axios, this.logger);
    this.resourceAttachments = new ResourceAttachments(this.axios, this.logger);
    this.opportunityAttachments = new OpportunityAttachments(this.axios, this.logger);

    // Core notes
    this.companyNotes = new CompanyNotes(this.axios, this.logger);
    this.ticketNotes = new TicketNotes(this.axios, this.logger);
    this.projectNotes = new ProjectNotes(this.axios, this.logger);
    this.taskNotes = new TaskNotes(this.axios, this.logger);
    this.companyNoteAttachments = new CompanyNoteAttachments(this.axios, this.logger);
    this.ticketNoteAttachments = new TicketNoteAttachments(this.axios, this.logger);
    this.projectNoteAttachments = new ProjectNoteAttachments(this.axios, this.logger);
    this.taskNoteAttachments = new TaskNoteAttachments(this.axios, this.logger);

    // Extended ticket entities
    this.ticketCategories = new TicketCategories(this.axios, this.logger);
    this.ticketCategoryFieldDefaults = new TicketCategoryFieldDefaults(this.axios, this.logger);
    this.ticketAdditionalConfigurationItems = new TicketAdditionalConfigurationItems(this.axios, this.logger);
    this.ticketAdditionalContacts = new TicketAdditionalContacts(this.axios, this.logger);
    this.ticketChangeRequestApprovals = new TicketChangeRequestApprovals(this.axios, this.logger);
    this.ticketCharges = new TicketCharges(this.axios, this.logger);
    this.ticketChecklistItems = new TicketChecklistItems(this.axios, this.logger);
    this.ticketChecklistLibraries = new TicketChecklistLibraries(this.axios, this.logger);
    this.ticketHistory = new TicketHistory(this.axios, this.logger);
    this.ticketRmaCredits = new TicketRmaCredits(this.axios, this.logger);
    this.ticketSecondaryResources = new TicketSecondaryResources(this.axios, this.logger);
    this.ticketTagAssociations = new TicketTagAssociations(this.axios, this.logger);

    // Extended task entities
    this.taskPredecessors = new TaskPredecessors(this.axios, this.logger);
    this.taskSecondaryResources = new TaskSecondaryResources(this.axios, this.logger);

    // Extended project entities
    this.projectCharges = new ProjectCharges(this.axios, this.logger);

    // Extended company entities
    this.companyAlerts = new CompanyAlerts(this.axios, this.logger);
    this.companyCategories = new CompanyCategories(this.axios, this.logger);
    this.companyLocations = new CompanyLocations(this.axios, this.logger);
    this.companySiteConfigurations = new CompanySiteConfigurations(this.axios, this.logger);
    this.companyTeams = new CompanyTeams(this.axios, this.logger);
    this.companyToDos = new CompanyToDos(this.axios, this.logger);

    // Extended contact entities
    this.contactBillingProductAssociations = new ContactBillingProductAssociations(this.axios, this.logger);
    this.contactGroups = new ContactGroups(this.axios, this.logger);
    this.contactGroupContacts = new ContactGroupContacts(this.axios, this.logger);
  }

  getName(): string {
    return 'CoreClient';
  }

  protected async doConnectionTest(): Promise<void> {
    // Test connection with a simple companies query
    await this.axios.get('/Companies?$select=id&$top=1');
  }

  // Convenience methods for common operations

  /**
   * Get active companies
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active companies
   */
  async getActiveCompanies(pageSize: number = 500) {
    return this.companies.list({
      filter: [
        {
          op: 'eq',
          field: 'isActive',
          value: true,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get active tickets
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active tickets
   */
  async getActiveTickets(pageSize: number = 500) {
    return this.tickets.list({
      filter: [
        {
          op: 'neq',
          field: 'status',
          value: 5, // Completed status
        },
      ],
      pageSize,
    });
  }

  /**
   * Get active projects
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active projects
   */
  async getActiveProjects(pageSize: number = 500) {
    return this.projects.list({
      filter: [
        {
          op: 'eq',
          field: 'status',
          value: 1, // Active status
        },
      ],
      pageSize,
    });
  }

  /**
   * Get active tasks
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active tasks
   */
  async getActiveTasks(pageSize: number = 500) {
    return this.tasks.list({
      filter: [
        {
          op: 'neq',
          field: 'isComplete',
          value: true,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get active opportunities
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active opportunities
   */
  async getActiveOpportunities(pageSize: number = 500) {
    return this.opportunities.list({
      filter: [
        {
          op: 'eq',
          field: 'status',
          value: 1, // Open status
        },
      ],
      pageSize,
    });
  }

  /**
   * Get tickets by company
   * @param companyId - Company ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with company tickets
   */
  async getTicketsByCompany(companyId: number, pageSize: number = 500) {
    return this.tickets.list({
      filter: [
        {
          op: 'eq',
          field: 'companyID',
          value: companyId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get projects by company
   * @param companyId - Company ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with company projects
   */
  async getProjectsByCompany(companyId: number, pageSize: number = 500) {
    return this.projects.list({
      filter: [
        {
          op: 'eq',
          field: 'companyID',
          value: companyId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get contacts by company
   * @param companyId - Company ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with company contacts
   */
  async getContactsByCompany(companyId: number, pageSize: number = 500) {
    return this.contacts.list({
      filter: [
        {
          op: 'eq',
          field: 'companyID',
          value: companyId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get opportunities by company
   * @param companyId - Company ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with company opportunities
   */
  async getOpportunitiesByCompany(companyId: number, pageSize: number = 500) {
    return this.opportunities.list({
      filter: [
        {
          op: 'eq',
          field: 'accountID',
          value: companyId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get recent tickets created within specified days
   * @param days - Number of days to look back (default: 7)
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with recent tickets
   */
  async getRecentTickets(days: number = 7, pageSize: number = 500) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.tickets.list({
      filter: [
        {
          op: 'gte',
          field: 'createDate',
          value: cutoffDate.toISOString(),
        },
      ],
      pageSize,
      sort: 'createDate desc',
    });
  }

  /**
   * Get recent projects created within specified days
   * @param days - Number of days to look back (default: 30)
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with recent projects
   */
  async getRecentProjects(days: number = 30, pageSize: number = 500) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.projects.list({
      filter: [
        {
          op: 'gte',
          field: 'createDate',
          value: cutoffDate.toISOString(),
        },
      ],
      pageSize,
      sort: 'createDate desc',
    });
  }

  /**
   * Get recent tasks created within specified days
   * @param days - Number of days to look back (default: 14)
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with recent tasks
   */
  async getRecentTasks(days: number = 14, pageSize: number = 500) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.tasks.list({
      filter: [
        {
          op: 'gte',
          field: 'createDate',
          value: cutoffDate.toISOString(),
        },
      ],
      pageSize,
      sort: 'createDate desc',
    });
  }

  /**
   * Search companies by name or other criteria
   * @param query - Search query string
   * @param searchFields - Fields to search in (default: ['companyName'])
   * @param pageSize - Number of records to return (default: 100)
   * @returns Promise with matching companies
   */
  async searchCompanies(
    query: string,
    searchFields: string[] = ['companyName'],
    pageSize: number = 100
  ) {
    const filters = searchFields.map(field => ({
      op: 'contains',
      field,
      value: query,
    }));

    return this.companies.list({
      filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
      pageSize,
      sort: 'companyName asc',
    });
  }

  /**
   * Search tickets by title, description or ticket number
   * @param query - Search query string
   * @param searchFields - Fields to search in (default: ['title', 'description'])
   * @param pageSize - Number of records to return (default: 100)
   * @returns Promise with matching tickets
   */
  async searchTickets(
    query: string,
    searchFields: string[] = ['title', 'description'],
    pageSize: number = 100
  ) {
    const filters = searchFields.map(field => ({
      op: 'contains',
      field,
      value: query,
    }));

    return this.tickets.list({
      filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
      pageSize,
      sort: 'createDate desc',
    });
  }

  /**
   * Search contacts by name or email
   * @param query - Search query string
   * @param searchFields - Fields to search in (default: ['firstName', 'lastName', 'emailAddress'])
   * @param pageSize - Number of records to return (default: 100)
   * @returns Promise with matching contacts
   */
  async searchContacts(
    query: string,
    searchFields: string[] = ['firstName', 'lastName', 'emailAddress'],
    pageSize: number = 100
  ) {
    const filters = searchFields.map(field => ({
      op: 'contains',
      field,
      value: query,
    }));

    return this.contacts.list({
      filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
      pageSize,
      sort: 'lastName asc',
    });
  }

  /**
   * Search projects by name or description
   * @param query - Search query string
   * @param searchFields - Fields to search in (default: ['projectName', 'description'])
   * @param pageSize - Number of records to return (default: 100)
   * @returns Promise with matching projects
   */
  async searchProjects(
    query: string,
    searchFields: string[] = ['projectName', 'description'],
    pageSize: number = 100
  ) {
    const filters = searchFields.map(field => ({
      op: 'contains',
      field,
      value: query,
    }));

    return this.projects.list({
      filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
      pageSize,
      sort: 'projectName asc',
    });
  }
}