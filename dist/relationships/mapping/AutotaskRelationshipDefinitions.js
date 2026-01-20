"use strict";
/**
 * Comprehensive Autotask entity relationship definitions
 * Based on the Autotask REST API entity structure
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutotaskRelationshipDefinitions = void 0;
class AutotaskRelationshipDefinitions {
    /**
     * Get all relationship definitions
     */
    static getAllRelationships() {
        return [...this.relationships];
    }
    /**
     * Get relationships for a specific entity
     */
    static getRelationshipsForEntity(entityName) {
        return this.relationships.filter(rel => rel.sourceEntity === entityName || rel.targetEntity === entityName);
    }
    /**
     * Get outgoing relationships for an entity
     */
    static getOutgoingRelationships(entityName) {
        return this.relationships.filter(rel => rel.sourceEntity === entityName);
    }
    /**
     * Get incoming relationships for an entity
     */
    static getIncomingRelationships(entityName) {
        return this.relationships.filter(rel => rel.targetEntity === entityName);
    }
    /**
     * Get relationship by ID
     */
    static getRelationshipById(relationshipId) {
        return this.relationships.find(rel => rel.id === relationshipId);
    }
    /**
     * Get direct relationship between two entities
     */
    static getDirectRelationship(sourceEntity, targetEntity) {
        return this.relationships.find(rel => rel.sourceEntity === sourceEntity && rel.targetEntity === targetEntity);
    }
    /**
     * Get core entities (frequently used in relationships)
     */
    static getCoreEntities() {
        return [
            'Companies',
            'Contacts',
            'Tickets',
            'Projects',
            'Tasks',
            'Resources',
            'TimeEntries',
            'Contracts',
            'ConfigurationItems',
            'Opportunities'
        ];
    }
    /**
     * Get entities with high cascade risk (many dependents)
     */
    static getHighCascadeRiskEntities() {
        const entityDependentCounts = new Map();
        this.relationships.forEach(rel => {
            const count = entityDependentCounts.get(rel.sourceEntity) || 0;
            entityDependentCounts.set(rel.sourceEntity, count + 1);
        });
        return Array.from(entityDependentCounts.entries())
            .filter(([_, count]) => count >= 5)
            .map(([entity, _]) => entity);
    }
}
exports.AutotaskRelationshipDefinitions = AutotaskRelationshipDefinitions;
AutotaskRelationshipDefinitions.relationships = [
    // ============= CORE ENTITY RELATIONSHIPS =============
    // Company -> Contacts (One-to-Many)
    {
        id: 'company-contacts',
        sourceEntity: 'Companies',
        targetEntity: 'Contacts',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['companyID'],
        relationshipName: 'contacts',
        inverseRelationshipName: 'company',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'SET_NULL'
        },
        loadingStrategy: 'LAZY',
        metadata: {
            description: 'Companies can have multiple contacts',
            isSystemManaged: false,
            businessRules: ['Contact must belong to an active company'],
            performance: {
                isIndexed: true,
                expectedCardinality: 50,
                queryFrequency: 'HIGH'
            }
        }
    },
    // Company -> Tickets (One-to-Many)
    {
        id: 'company-tickets',
        sourceEntity: 'Companies',
        targetEntity: 'Tickets',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['companyID'],
        relationshipName: 'tickets',
        inverseRelationshipName: 'company',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Companies can have multiple tickets',
            businessRules: ['Active tickets prevent company deletion'],
            performance: {
                isIndexed: true,
                expectedCardinality: 200,
                queryFrequency: 'CRITICAL'
            }
        }
    },
    // Company -> Projects (One-to-Many)
    {
        id: 'company-projects',
        sourceEntity: 'Companies',
        targetEntity: 'Projects',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['companyID'],
        relationshipName: 'projects',
        inverseRelationshipName: 'company',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        loadingStrategy: 'LAZY',
        metadata: {
            description: 'Companies can have multiple projects',
            businessRules: ['Active projects prevent company deletion'],
            performance: {
                expectedCardinality: 25,
                queryFrequency: 'HIGH'
            }
        }
    },
    // Company -> Contracts (One-to-Many)
    {
        id: 'company-contracts',
        sourceEntity: 'Companies',
        targetEntity: 'Contracts',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['companyID'],
        relationshipName: 'contracts',
        inverseRelationshipName: 'company',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        loadingStrategy: 'LAZY',
        metadata: {
            description: 'Companies can have multiple contracts',
            performance: {
                expectedCardinality: 10,
                queryFrequency: 'MEDIUM'
            }
        }
    },
    // Company -> Opportunities (One-to-Many)
    {
        id: 'company-opportunities',
        sourceEntity: 'Companies',
        targetEntity: 'Opportunities',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['companyID'],
        relationshipName: 'opportunities',
        inverseRelationshipName: 'company',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Companies can have multiple opportunities'
        }
    },
    // Company -> Configuration Items (One-to-Many)
    {
        id: 'company-configurationitems',
        sourceEntity: 'Companies',
        targetEntity: 'ConfigurationItems',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['companyID'],
        relationshipName: 'configurationItems',
        inverseRelationshipName: 'company',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Companies can have multiple configuration items',
            performance: {
                expectedCardinality: 100,
                queryFrequency: 'MEDIUM'
            }
        }
    },
    // ============= PROJECT RELATIONSHIPS =============
    // Project -> Tasks (One-to-Many)
    {
        id: 'project-tasks',
        sourceEntity: 'Projects',
        targetEntity: 'Tasks',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['projectID'],
        relationshipName: 'tasks',
        inverseRelationshipName: 'project',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'EAGER',
        metadata: {
            description: 'Projects can have multiple tasks',
            businessRules: ['Tasks inherit project permissions'],
            performance: {
                expectedCardinality: 30,
                queryFrequency: 'HIGH'
            }
        }
    },
    // Project -> Time Entries (One-to-Many)
    {
        id: 'project-timeentries',
        sourceEntity: 'Projects',
        targetEntity: 'TimeEntries',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['projectID'],
        relationshipName: 'timeEntries',
        inverseRelationshipName: 'project',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Projects can have multiple time entries',
            businessRules: ['Time entries prevent project deletion']
        }
    },
    // ============= TICKET RELATIONSHIPS =============
    // Ticket -> Time Entries (One-to-Many)
    {
        id: 'ticket-timeentries',
        sourceEntity: 'Tickets',
        targetEntity: 'TimeEntries',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['ticketID'],
        relationshipName: 'timeEntries',
        inverseRelationshipName: 'ticket',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'LAZY',
        metadata: {
            description: 'Tickets can have multiple time entries'
        }
    },
    // Ticket -> Ticket Notes (One-to-Many)
    {
        id: 'ticket-ticketnotes',
        sourceEntity: 'Tickets',
        targetEntity: 'TicketNotes',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['ticketID'],
        relationshipName: 'notes',
        inverseRelationshipName: 'ticket',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'LAZY',
        metadata: {
            description: 'Tickets can have multiple notes'
        }
    },
    // Ticket -> Ticket Attachments (One-to-Many)
    {
        id: 'ticket-ticketattachments',
        sourceEntity: 'Tickets',
        targetEntity: 'TicketAttachments',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['parentID'],
        relationshipName: 'attachments',
        inverseRelationshipName: 'ticket',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Tickets can have multiple attachments'
        }
    },
    // ============= TASK RELATIONSHIPS =============
    // Task -> Time Entries (One-to-Many)
    {
        id: 'task-timeentries',
        sourceEntity: 'Tasks',
        targetEntity: 'TimeEntries',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['taskID'],
        relationshipName: 'timeEntries',
        inverseRelationshipName: 'task',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'LAZY',
        metadata: {
            description: 'Tasks can have multiple time entries'
        }
    },
    // Task -> Task Predecessors (Self-referencing Many-to-Many)
    {
        id: 'task-predecessors',
        sourceEntity: 'Tasks',
        targetEntity: 'TaskPredecessors',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['successorTaskID'],
        relationshipName: 'predecessors',
        inverseRelationshipName: 'successorTask',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'EAGER',
        metadata: {
            description: 'Tasks can have predecessor dependencies'
        }
    },
    // ============= CONTRACT RELATIONSHIPS =============
    // Contract -> Contract Services (One-to-Many)
    {
        id: 'contract-contractservices',
        sourceEntity: 'Contracts',
        targetEntity: 'ContractServices',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['contractID'],
        relationshipName: 'services',
        inverseRelationshipName: 'contract',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'EAGER',
        metadata: {
            description: 'Contracts can have multiple services'
        }
    },
    // Contract -> Contract Rates (One-to-Many)
    {
        id: 'contract-contractrates',
        sourceEntity: 'Contracts',
        targetEntity: 'ContractRates',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['contractID'],
        relationshipName: 'rates',
        inverseRelationshipName: 'contract',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'EAGER',
        metadata: {
            description: 'Contracts can have multiple billing rates'
        }
    },
    // ============= RESOURCE RELATIONSHIPS =============
    // Resource -> Time Entries (One-to-Many)
    {
        id: 'resource-timeentries',
        sourceEntity: 'Resources',
        targetEntity: 'TimeEntries',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['resourceID'],
        relationshipName: 'timeEntries',
        inverseRelationshipName: 'resource',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Resources can have multiple time entries',
            businessRules: ['Time entries prevent resource deletion']
        }
    },
    // Resource -> Tickets (One-to-Many) - Primary Resource
    {
        id: 'resource-tickets-primary',
        sourceEntity: 'Resources',
        targetEntity: 'Tickets',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['assignedResourceID'],
        relationshipName: 'assignedTickets',
        inverseRelationshipName: 'assignedResource',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'SET_NULL'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Resources can be assigned to multiple tickets'
        }
    },
    // Resource -> Tasks (One-to-Many) - Primary Resource
    {
        id: 'resource-tasks-primary',
        sourceEntity: 'Resources',
        targetEntity: 'Tasks',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['assignedResourceID'],
        relationshipName: 'assignedTasks',
        inverseRelationshipName: 'assignedResource',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'SET_NULL'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Resources can be assigned to multiple tasks'
        }
    },
    // ============= CONFIGURATION ITEM RELATIONSHIPS =============
    // Configuration Item -> Configuration Item Related Items (Self-referencing)
    {
        id: 'configurationitem-relateditems',
        sourceEntity: 'ConfigurationItems',
        targetEntity: 'ConfigurationItemRelatedItems',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['configurationItemID'],
        relationshipName: 'relatedItems',
        inverseRelationshipName: 'configurationItem',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'LAZY',
        metadata: {
            description: 'Configuration items can have related items'
        }
    },
    // Configuration Item -> Tickets (One-to-Many)
    {
        id: 'configurationitem-tickets',
        sourceEntity: 'ConfigurationItems',
        targetEntity: 'Tickets',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['configurationItemID'],
        relationshipName: 'tickets',
        inverseRelationshipName: 'configurationItem',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'SET_NULL'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Configuration items can have associated tickets'
        }
    },
    // ============= ATTACHMENT RELATIONSHIPS =============
    // Companies -> Company Attachments
    {
        id: 'company-companyattachments',
        sourceEntity: 'Companies',
        targetEntity: 'CompanyAttachments',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['parentID'],
        relationshipName: 'attachments',
        inverseRelationshipName: 'company',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Companies can have multiple attachments'
        }
    },
    // Projects -> Project Attachments
    {
        id: 'project-projectattachments',
        sourceEntity: 'Projects',
        targetEntity: 'ProjectAttachments',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['parentID'],
        relationshipName: 'attachments',
        inverseRelationshipName: 'project',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Projects can have multiple attachments'
        }
    },
    // Tasks -> Task Attachments
    {
        id: 'task-taskattachments',
        sourceEntity: 'Tasks',
        targetEntity: 'TaskAttachments',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['parentID'],
        relationshipName: 'attachments',
        inverseRelationshipName: 'task',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Tasks can have multiple attachments'
        }
    },
    // ============= NOTE RELATIONSHIPS =============
    // Companies -> Company Notes
    {
        id: 'company-companynotes',
        sourceEntity: 'Companies',
        targetEntity: 'CompanyNotes',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['companyID'],
        relationshipName: 'notes',
        inverseRelationshipName: 'company',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Companies can have multiple notes'
        }
    },
    // Projects -> Project Notes
    {
        id: 'project-projectnotes',
        sourceEntity: 'Projects',
        targetEntity: 'ProjectNotes',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['projectID'],
        relationshipName: 'notes',
        inverseRelationshipName: 'project',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Projects can have multiple notes'
        }
    },
    // Tasks -> Task Notes
    {
        id: 'task-tasknotes',
        sourceEntity: 'Tasks',
        targetEntity: 'TaskNotes',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['taskID'],
        relationshipName: 'notes',
        inverseRelationshipName: 'task',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'ON_DEMAND',
        metadata: {
            description: 'Tasks can have multiple notes'
        }
    },
    // ============= MANY-TO-MANY RELATIONSHIPS =============
    // Resources -> Resource Roles (Many-to-Many through ResourceRoles)
    {
        id: 'resource-resourceroles',
        sourceEntity: 'Resources',
        targetEntity: 'ResourceRoles',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['resourceID'],
        relationshipName: 'roles',
        inverseRelationshipName: 'resource',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'EAGER',
        metadata: {
            description: 'Resources can have multiple roles'
        }
    },
    // Resources -> Resource Skills (Many-to-Many through ResourceSkills)
    {
        id: 'resource-resourceskills',
        sourceEntity: 'Resources',
        targetEntity: 'ResourceSkills',
        relationshipType: 'ONE_TO_MANY',
        sourceFields: ['id'],
        targetFields: ['resourceID'],
        relationshipName: 'skills',
        inverseRelationshipName: 'resource',
        required: false,
        cascadeOptions: {
            onCreate: 'CASCADE',
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        loadingStrategy: 'LAZY',
        metadata: {
            description: 'Resources can have multiple skills'
        }
    }
];
//# sourceMappingURL=AutotaskRelationshipDefinitions.js.map