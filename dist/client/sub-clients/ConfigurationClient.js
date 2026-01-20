"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationClient = void 0;
const BaseSubClient_1 = require("../base/BaseSubClient");
const entities_1 = require("../../entities");
/**
 * ConfigurationClient handles all configuration and system setup entities:
 * - Configuration items and asset management
 * - Organizational structure and departments
 * - Locations and business hours
 * - System reference data and lookups
 * - User-defined fields and customizations
 */
class ConfigurationClient extends BaseSubClient_1.BaseSubClient {
    constructor(axios, logger) {
        super(axios, logger, 'ConfigurationClient');
        // Configuration items
        this.configurationItems = new entities_1.ConfigurationItems(this.axios, this.logger);
        this.configurationItemAttachments = new entities_1.ConfigurationItemAttachments(this.axios, this.logger);
        this.configurationItemBillingProductAssociations = new entities_1.ConfigurationItemBillingProductAssociations(this.axios, this.logger);
        this.configurationItemCategories = new entities_1.ConfigurationItemCategories(this.axios, this.logger);
        this.configurationItemCategoryUdfAssociations = new entities_1.ConfigurationItemCategoryUdfAssociations(this.axios, this.logger);
        this.configurationItemDnsRecords = new entities_1.ConfigurationItemDnsRecords(this.axios, this.logger);
        this.configurationItemNotes = new entities_1.ConfigurationItemNotes(this.axios, this.logger);
        this.configurationItemNoteAttachments = new entities_1.ConfigurationItemNoteAttachments(this.axios, this.logger);
        this.configurationItemRelatedItems = new entities_1.ConfigurationItemRelatedItems(this.axios, this.logger);
        this.configurationItemSslSubjectAlternativeName = new entities_1.ConfigurationItemSslSubjectAlternativeName(this.axios, this.logger);
        this.configurationItemTypes = new entities_1.ConfigurationItemTypes(this.axios, this.logger);
        // Organizational structure
        this.departments = new entities_1.Departments(this.axios, this.logger);
        this.organizationalLevel1 = new entities_1.OrganizationalLevel1(this.axios, this.logger);
        this.organizationalLevel2 = new entities_1.OrganizationalLevel2(this.axios, this.logger);
        this.organizationalLevelAssociations = new entities_1.OrganizationalLevelAssociations(this.axios, this.logger);
        this.organizatonalResources = new entities_1.OrganizatonalResources(this.axios, this.logger);
        // Locations
        this.internalLocations = new entities_1.InternalLocations(this.axios, this.logger);
        this.internalLocationWithBusinessHours = new entities_1.InternalLocationWithBusinessHours(this.axios, this.logger);
        // Reference entities
        this.countries = new entities_1.Countries(this.axios, this.logger);
        this.roles = new entities_1.Roles(this.axios, this.logger);
        this.skills = new entities_1.Skills(this.axios, this.logger);
        this.resourceSkills = new entities_1.ResourceSkills(this.axios, this.logger);
        this.resourceRoles = new entities_1.ResourceRoles(this.axios, this.logger);
        this.resourceRoleDepartments = new entities_1.ResourceRoleDepartments(this.axios, this.logger);
        this.resourceRoleQueues = new entities_1.ResourceRoleQueues(this.axios, this.logger);
        this.resourceServiceDeskRoles = new entities_1.ResourceServiceDeskRoles(this.axios, this.logger);
        // System entities
        this.actionTypes = new entities_1.ActionTypes(this.axios, this.logger);
        this.classificationIcons = new entities_1.ClassificationIcons(this.axios, this.logger);
        this.modules = new entities_1.Modules(this.axios, this.logger);
        this.version = new entities_1.Version(this.axios, this.logger);
        this.shippingTypes = new entities_1.ShippingTypes(this.axios, this.logger);
        this.domainRegistrars = new entities_1.DomainRegistrars(this.axios, this.logger);
        this.workTypeModifiers = new entities_1.WorkTypeModifiers(this.axios, this.logger);
        this.phases = new entities_1.Phases(this.axios, this.logger);
        // User-defined fields
        this.userDefinedFieldDefinitions = new entities_1.UserDefinedFieldDefinitions(this.axios, this.logger);
        this.userDefinedFieldListItems = new entities_1.UserDefinedFieldListItems(this.axios, this.logger);
        // Holidays and scheduling
        this.holidays = new entities_1.Holidays(this.axios, this.logger);
        this.holidaySets = new entities_1.HolidaySets(this.axios, this.logger);
    }
    getName() {
        return 'ConfigurationClient';
    }
    async doConnectionTest() {
        // Test connection with a simple configuration item categories query
        await this.axios.get('/ConfigurationItemCategories?$select=id&$top=1');
    }
    // Convenience methods for common operations
    /**
     * Get active configuration items
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active configuration items
     */
    async getActiveConfigurationItems(pageSize = 500) {
        return this.configurationItems.list({
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
     * Get configuration items by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company configuration items
     */
    async getConfigurationItemsByCompany(companyId, pageSize = 500) {
        return this.configurationItems.list({
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
     * Get configuration items by type
     * @param typeId - Configuration item type ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with configuration items of specified type
     */
    async getConfigurationItemsByType(typeId, pageSize = 500) {
        return this.configurationItems.list({
            filter: [
                {
                    op: 'eq',
                    field: 'configurationItemType',
                    value: typeId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get configuration items by category
     * @param categoryId - Configuration item category ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with configuration items in specified category
     */
    async getConfigurationItemsByCategory(categoryId, pageSize = 500) {
        return this.configurationItems.list({
            filter: [
                {
                    op: 'eq',
                    field: 'configurationItemCategoryID',
                    value: categoryId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get active departments
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active departments
     */
    async getActiveDepartments(pageSize = 500) {
        return this.departments.list({
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
     * Get active roles
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active roles
     */
    async getActiveRoles(pageSize = 500) {
        return this.roles.list({
            filter: [
                {
                    op: 'eq',
                    field: 'active',
                    value: true,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get active skills
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active skills
     */
    async getActiveSkills(pageSize = 500) {
        return this.skills.list({
            filter: [
                {
                    op: 'eq',
                    field: 'active',
                    value: true,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get resource skills by resource
     * @param resourceId - Resource ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with resource skills
     */
    async getResourceSkillsByResource(resourceId, pageSize = 500) {
        return this.resourceSkills.list({
            filter: [
                {
                    op: 'eq',
                    field: 'resourceID',
                    value: resourceId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get resource roles by resource
     * @param resourceId - Resource ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with resource roles
     */
    async getResourceRolesByResource(resourceId, pageSize = 500) {
        return this.resourceRoles.list({
            filter: [
                {
                    op: 'eq',
                    field: 'resourceID',
                    value: resourceId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get recent configuration items created within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent configuration items
     */
    async getRecentConfigurationItems(days = 30, pageSize = 500) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return this.configurationItems.list({
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
     * Search configuration items by name or serial number
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['referenceTitle', 'serialNumber'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching configuration items
     */
    async searchConfigurationItems(query, searchFields = ['referenceTitle', 'serialNumber'], pageSize = 100) {
        const filters = searchFields.map(field => ({
            op: 'contains',
            field,
            value: query,
        }));
        return this.configurationItems.list({
            filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
            pageSize,
            sort: 'referenceTitle asc',
        });
    }
    /**
     * Get active configuration item types
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active configuration item types
     */
    async getActiveConfigurationItemTypes(pageSize = 500) {
        return this.configurationItemTypes.list({
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
     * Get active internal locations
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active internal locations
     */
    async getActiveInternalLocations(pageSize = 500) {
        return this.internalLocations.list({
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
     * Get user-defined field definitions by entity type
     * @param entityType - Entity type (e.g., 'Ticket', 'Company', 'Contact')
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with UDF definitions for entity type
     */
    async getUserDefinedFieldDefinitionsByEntityType(entityType, pageSize = 500) {
        return this.userDefinedFieldDefinitions.list({
            filter: [
                {
                    op: 'eq',
                    field: 'udfEntityType',
                    value: entityType,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get active user-defined field definitions
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active UDF definitions
     */
    async getActiveUserDefinedFieldDefinitions(pageSize = 500) {
        return this.userDefinedFieldDefinitions.list({
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
     * Get UDF list items by field definition
     * @param udfId - UDF definition ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with UDF list items
     */
    async getUserDefinedFieldListItemsByUdf(udfId, pageSize = 500) {
        return this.userDefinedFieldListItems.list({
            filter: [
                {
                    op: 'eq',
                    field: 'userDefinedFieldDefinitionID',
                    value: udfId,
                },
            ],
            pageSize,
        });
    }
    /**
     * Get configuration item related items by parent
     * @param parentConfigItemId - Parent configuration item ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with related configuration items
     */
    async getConfigurationItemRelatedItemsByParent(parentConfigItemId, pageSize = 500) {
        return this.configurationItemRelatedItems.list({
            filter: [
                {
                    op: 'eq',
                    field: 'parentConfigurationItemID',
                    value: parentConfigItemId,
                },
            ],
            pageSize,
        });
    }
}
exports.ConfigurationClient = ConfigurationClient;
//# sourceMappingURL=ConfigurationClient.js.map