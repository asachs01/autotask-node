"use strict";
/**
 * Queryable Entity Base Class
 * Provides query builder functionality to entity classes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryableEntity = void 0;
const queryBuilder_1 = require("./queryBuilder");
/**
 * Base class for entities that support advanced querying
 */
class QueryableEntity {
    constructor(axios, logger) {
        this.axios = axios;
        this.logger = logger;
    }
    /**
     * Create a new query builder for this entity
     */
    query() {
        return new queryBuilder_1.QueryBuilder(this.axios, this.logger, this.endpoint, this.entityName);
    }
    /**
     * Convenience method for simple queries
     */
    where(field, operator, value) {
        return this.query().where(field, operator, value);
    }
    /**
     * Convenience method for finding by ID
     */
    async findById(id) {
        return this.query().where('id', 'eq', id).first();
    }
    /**
     * Convenience method for finding all records
     */
    async findAll() {
        const result = await this.query().execute();
        return result.data;
    }
    /**
     * Convenience method for finding with pagination
     */
    async findPaginated(page = 1, pageSize = 50) {
        return this.query().page(page).pageSize(pageSize).execute();
    }
    /**
     * Convenience method for counting records
     */
    async countAll() {
        return this.query().count();
    }
    /**
     * Convenience method for checking if records exist
     */
    async exists(field, value) {
        return this.query()
            .where(field, 'eq', value)
            .exists();
    }
}
exports.QueryableEntity = QueryableEntity;
//# sourceMappingURL=queryableEntity.js.map