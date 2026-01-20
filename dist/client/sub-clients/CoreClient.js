"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreClient = void 0;
const BaseSubClient_1 = require("../base/BaseSubClient");
const entities_1 = require("../../entities");
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
class CoreClient extends BaseSubClient_1.BaseSubClient {
    constructor(axios, logger) {
        super(axios, logger, 'CoreClient');
        // Initialize all core entities
        this.companies = new entities_1.Companies(this.axios, this.logger);
        this.contacts = new entities_1.Contacts(this.axios, this.logger);
        this.tickets = new entities_1.Tickets(this.axios, this.logger);
        this.projects = new entities_1.Projects(this.axios, this.logger);
        this.tasks = new entities_1.Tasks(this.axios, this.logger);
        this.opportunities = new entities_1.Opportunities(this.axios, this.logger);
        this.resources = new entities_1.Resources(this.axios, this.logger);
        // Core attachments
        this.companyAttachments = new entities_1.CompanyAttachments(this.axios, this.logger);
        this.ticketAttachments = new entities_1.TicketAttachments(this.axios, this.logger);
        this.projectAttachments = new entities_1.ProjectAttachments(this.axios, this.logger);
        this.taskAttachments = new entities_1.TaskAttachments(this.axios, this.logger);
        this.resourceAttachments = new entities_1.ResourceAttachments(this.axios, this.logger);
        this.opportunityAttachments = new entities_1.OpportunityAttachments(this.axios, this.logger);
        // Core notes
        this.companyNotes = new entities_1.CompanyNotes(this.axios, this.logger);
        this.ticketNotes = new entities_1.TicketNotes(this.axios, this.logger);
        this.projectNotes = new entities_1.ProjectNotes(this.axios, this.logger);
        this.taskNotes = new entities_1.TaskNotes(this.axios, this.logger);
        this.companyNoteAttachments = new entities_1.CompanyNoteAttachments(this.axios, this.logger);
        this.ticketNoteAttachments = new entities_1.TicketNoteAttachments(this.axios, this.logger);
        this.projectNoteAttachments = new entities_1.ProjectNoteAttachments(this.axios, this.logger);
        this.taskNoteAttachments = new entities_1.TaskNoteAttachments(this.axios, this.logger);
        // Extended ticket entities
        this.ticketCategories = new entities_1.TicketCategories(this.axios, this.logger);
        this.ticketCategoryFieldDefaults = new entities_1.TicketCategoryFieldDefaults(this.axios, this.logger);
        this.ticketAdditionalConfigurationItems = new entities_1.TicketAdditionalConfigurationItems(this.axios, this.logger);
        this.ticketAdditionalContacts = new entities_1.TicketAdditionalContacts(this.axios, this.logger);
        this.ticketChangeRequestApprovals = new entities_1.TicketChangeRequestApprovals(this.axios, this.logger);
        this.ticketCharges = new entities_1.TicketCharges(this.axios, this.logger);
        this.ticketChecklistItems = new entities_1.TicketChecklistItems(this.axios, this.logger);
        this.ticketChecklistLibraries = new entities_1.TicketChecklistLibraries(this.axios, this.logger);
        this.ticketHistory = new entities_1.TicketHistory(this.axios, this.logger);
        this.ticketRmaCredits = new entities_1.TicketRmaCredits(this.axios, this.logger);
        this.ticketSecondaryResources = new entities_1.TicketSecondaryResources(this.axios, this.logger);
        this.ticketTagAssociations = new entities_1.TicketTagAssociations(this.axios, this.logger);
        // Extended task entities
        this.taskPredecessors = new entities_1.TaskPredecessors(this.axios, this.logger);
        this.taskSecondaryResources = new entities_1.TaskSecondaryResources(this.axios, this.logger);
        // Extended project entities
        this.projectCharges = new entities_1.ProjectCharges(this.axios, this.logger);
        // Extended company entities
        this.companyAlerts = new entities_1.CompanyAlerts(this.axios, this.logger);
        this.companyCategories = new entities_1.CompanyCategories(this.axios, this.logger);
        this.companyLocations = new entities_1.CompanyLocations(this.axios, this.logger);
        this.companySiteConfigurations = new entities_1.CompanySiteConfigurations(this.axios, this.logger);
        this.companyTeams = new entities_1.CompanyTeams(this.axios, this.logger);
        this.companyToDos = new entities_1.CompanyToDos(this.axios, this.logger);
        // Extended contact entities
        this.contactBillingProductAssociations = new entities_1.ContactBillingProductAssociations(this.axios, this.logger);
        this.contactGroups = new entities_1.ContactGroups(this.axios, this.logger);
        this.contactGroupContacts = new entities_1.ContactGroupContacts(this.axios, this.logger);
    }
    getName() {
        return 'CoreClient';
    }
    async doConnectionTest() {
        // Test connection with a simple companies query
        await this.axios.get('/Companies?$select=id&$top=1');
    }
    // Convenience methods for common operations
    /**
     * Get active companies
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active companies
     */
    async getActiveCompanies(pageSize = 500) {
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
    async getActiveTickets(pageSize = 500) {
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
    async getActiveProjects(pageSize = 500) {
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
    async getActiveTasks(pageSize = 500) {
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
    async getActiveOpportunities(pageSize = 500) {
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
    async getTicketsByCompany(companyId, pageSize = 500) {
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
    async getProjectsByCompany(companyId, pageSize = 500) {
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
    async getContactsByCompany(companyId, pageSize = 500) {
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
    async getOpportunitiesByCompany(companyId, pageSize = 500) {
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
    async getRecentTickets(days = 7, pageSize = 500) {
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
    async getRecentProjects(days = 30, pageSize = 500) {
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
    async getRecentTasks(days = 14, pageSize = 500) {
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
    async searchCompanies(query, searchFields = ['companyName'], pageSize = 100) {
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
    async searchTickets(query, searchFields = ['title', 'description'], pageSize = 100) {
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
    async searchContacts(query, searchFields = ['firstName', 'lastName', 'emailAddress'], pageSize = 100) {
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
    async searchProjects(query, searchFields = ['projectName', 'description'], pageSize = 100) {
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
exports.CoreClient = CoreClient;
//# sourceMappingURL=CoreClient.js.map