import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import { ConfigurationItems, ConfigurationItemAttachments, ConfigurationItemBillingProductAssociations, ConfigurationItemCategories, ConfigurationItemCategoryUdfAssociations, ConfigurationItemDnsRecords, ConfigurationItemNotes, ConfigurationItemNoteAttachments, ConfigurationItemRelatedItems, ConfigurationItemSslSubjectAlternativeName, ConfigurationItemTypes, Departments, OrganizationalLevel1, OrganizationalLevel2, OrganizationalLevelAssociations, OrganizatonalResources, InternalLocations, InternalLocationWithBusinessHours, Countries, Roles, Skills, ResourceSkills, ResourceRoles, ResourceRoleDepartments, ResourceRoleQueues, ResourceServiceDeskRoles, ActionTypes, ClassificationIcons, Modules, Version, ShippingTypes, DomainRegistrars, WorkTypeModifiers, Phases, UserDefinedFieldDefinitions, UserDefinedFieldListItems, Holidays, HolidaySets } from '../../entities';
/**
 * ConfigurationClient handles all configuration and system setup entities:
 * - Configuration items and asset management
 * - Organizational structure and departments
 * - Locations and business hours
 * - System reference data and lookups
 * - User-defined fields and customizations
 */
export declare class ConfigurationClient extends BaseSubClient {
    readonly configurationItems: ConfigurationItems;
    readonly configurationItemAttachments: ConfigurationItemAttachments;
    readonly configurationItemBillingProductAssociations: ConfigurationItemBillingProductAssociations;
    readonly configurationItemCategories: ConfigurationItemCategories;
    readonly configurationItemCategoryUdfAssociations: ConfigurationItemCategoryUdfAssociations;
    readonly configurationItemDnsRecords: ConfigurationItemDnsRecords;
    readonly configurationItemNotes: ConfigurationItemNotes;
    readonly configurationItemNoteAttachments: ConfigurationItemNoteAttachments;
    readonly configurationItemRelatedItems: ConfigurationItemRelatedItems;
    readonly configurationItemSslSubjectAlternativeName: ConfigurationItemSslSubjectAlternativeName;
    readonly configurationItemTypes: ConfigurationItemTypes;
    readonly departments: Departments;
    readonly organizationalLevel1: OrganizationalLevel1;
    readonly organizationalLevel2: OrganizationalLevel2;
    readonly organizationalLevelAssociations: OrganizationalLevelAssociations;
    readonly organizatonalResources: OrganizatonalResources;
    readonly internalLocations: InternalLocations;
    readonly internalLocationWithBusinessHours: InternalLocationWithBusinessHours;
    readonly countries: Countries;
    readonly roles: Roles;
    readonly skills: Skills;
    readonly resourceSkills: ResourceSkills;
    readonly resourceRoles: ResourceRoles;
    readonly resourceRoleDepartments: ResourceRoleDepartments;
    readonly resourceRoleQueues: ResourceRoleQueues;
    readonly resourceServiceDeskRoles: ResourceServiceDeskRoles;
    readonly actionTypes: ActionTypes;
    readonly classificationIcons: ClassificationIcons;
    readonly modules: Modules;
    readonly version: Version;
    readonly shippingTypes: ShippingTypes;
    readonly domainRegistrars: DomainRegistrars;
    readonly workTypeModifiers: WorkTypeModifiers;
    readonly phases: Phases;
    readonly userDefinedFieldDefinitions: UserDefinedFieldDefinitions;
    readonly userDefinedFieldListItems: UserDefinedFieldListItems;
    readonly holidays: Holidays;
    readonly holidaySets: HolidaySets;
    constructor(axios: AxiosInstance, logger: winston.Logger);
    getName(): string;
    protected doConnectionTest(): Promise<void>;
    /**
     * Get active configuration items
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active configuration items
     */
    getActiveConfigurationItems(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/configurationitems").IConfigurationItems[]>>;
    /**
     * Get configuration items by company
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company configuration items
     */
    getConfigurationItemsByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/configurationitems").IConfigurationItems[]>>;
    /**
     * Get configuration items by type
     * @param typeId - Configuration item type ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with configuration items of specified type
     */
    getConfigurationItemsByType(typeId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/configurationitems").IConfigurationItems[]>>;
    /**
     * Get configuration items by category
     * @param categoryId - Configuration item category ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with configuration items in specified category
     */
    getConfigurationItemsByCategory(categoryId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/configurationitems").IConfigurationItems[]>>;
    /**
     * Get active departments
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active departments
     */
    getActiveDepartments(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/departments").IDepartments[]>>;
    /**
     * Get active roles
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active roles
     */
    getActiveRoles(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/roles").IRoles[]>>;
    /**
     * Get active skills
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active skills
     */
    getActiveSkills(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/skills").ISkills[]>>;
    /**
     * Get resource skills by resource
     * @param resourceId - Resource ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with resource skills
     */
    getResourceSkillsByResource(resourceId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/resourceskills").IResourceSkills[]>>;
    /**
     * Get resource roles by resource
     * @param resourceId - Resource ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with resource roles
     */
    getResourceRolesByResource(resourceId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/resourceroles").IResourceRoles[]>>;
    /**
     * Get recent configuration items created within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent configuration items
     */
    getRecentConfigurationItems(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/configurationitems").IConfigurationItems[]>>;
    /**
     * Search configuration items by name or serial number
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['referenceTitle', 'serialNumber'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching configuration items
     */
    searchConfigurationItems(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/configurationitems").IConfigurationItems[]>>;
    /**
     * Get active configuration item types
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active configuration item types
     */
    getActiveConfigurationItemTypes(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/configurationitemtypes").IConfigurationItemTypes[]>>;
    /**
     * Get active internal locations
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active internal locations
     */
    getActiveInternalLocations(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/internallocations").IInternalLocations[]>>;
    /**
     * Get user-defined field definitions by entity type
     * @param entityType - Entity type (e.g., 'Ticket', 'Company', 'Contact')
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with UDF definitions for entity type
     */
    getUserDefinedFieldDefinitionsByEntityType(entityType: string, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/userdefinedfielddefinitions").IUserDefinedFieldDefinitions[]>>;
    /**
     * Get active user-defined field definitions
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active UDF definitions
     */
    getActiveUserDefinedFieldDefinitions(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/userdefinedfielddefinitions").IUserDefinedFieldDefinitions[]>>;
    /**
     * Get UDF list items by field definition
     * @param udfId - UDF definition ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with UDF list items
     */
    getUserDefinedFieldListItemsByUdf(udfId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/userdefinedfieldlistitems").IUserDefinedFieldListItems[]>>;
    /**
     * Get configuration item related items by parent
     * @param parentConfigItemId - Parent configuration item ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with related configuration items
     */
    getConfigurationItemRelatedItemsByParent(parentConfigItemId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/configurationitemrelateditems").IConfigurationItemRelatedItems[]>>;
}
//# sourceMappingURL=ConfigurationClient.d.ts.map