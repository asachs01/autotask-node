"use strict";
/**
 * Advanced Query Builder Implementation for Autotask API
 * Provides fluent API for building complex queries
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
/**
 * Main QueryBuilder class implementing fluent query API
 */
class QueryBuilder {
    constructor(axios, logger, endpoint, entityName) {
        this.axios = axios;
        this.logger = logger;
        this.endpoint = endpoint;
        this.entityName = entityName;
        this.spec = {};
        this.currentGroup = { operator: 'and', conditions: [] };
        this.groupStack = [];
        this.spec.filters = this.currentGroup;
    }
    where(field, operator, value) {
        const condition = {
            field: String(field),
            operator,
            value,
        };
        this.currentGroup.conditions.push(condition);
        return this;
    }
    whereIn(field, values) {
        const condition = {
            field: String(field),
            operator: 'in',
            values,
        };
        this.currentGroup.conditions.push(condition);
        return this;
    }
    whereNotIn(field, values) {
        const condition = {
            field: String(field),
            operator: 'notIn',
            values,
        };
        this.currentGroup.conditions.push(condition);
        return this;
    }
    whereBetween(field, min, max) {
        const condition = {
            field: String(field),
            operator: 'between',
            values: [min, max],
        };
        this.currentGroup.conditions.push(condition);
        return this;
    }
    whereNull(field) {
        const condition = {
            field: String(field),
            operator: 'isNull',
        };
        this.currentGroup.conditions.push(condition);
        return this;
    }
    whereNotNull(field) {
        const condition = {
            field: String(field),
            operator: 'isNotNull',
        };
        this.currentGroup.conditions.push(condition);
        return this;
    }
    // LOGICAL GROUPING
    and(callback) {
        return this.createGroup('and', callback);
    }
    or(callback) {
        return this.createGroup('or', callback);
    }
    createGroup(operator, callback) {
        // Save current group state
        this.groupStack.push(this.currentGroup);
        // Create new group
        const newGroup = { operator, conditions: [] };
        this.currentGroup = newGroup;
        // Execute callback to build conditions in this group
        callback(this);
        // Restore previous group and add the new group as a condition
        const parentGroup = this.groupStack.pop();
        parentGroup.conditions.push(newGroup);
        this.currentGroup = parentGroup;
        return this;
    }
    orderBy(field, direction = 'asc') {
        if (!this.spec.sorts) {
            this.spec.sorts = [];
        }
        const sortSpec = {
            field: String(field),
            direction,
        };
        this.spec.sorts.push(sortSpec);
        return this;
    }
    /**
     * Add descending sort order (convenience method)
     */
    orderByDesc(field) {
        return this.orderBy(field, 'desc');
    }
    select(...fields) {
        this.spec.fields = fields.map(f => String(f));
        return this;
    }
    // RELATED ENTITIES
    include(entity, fields, alias) {
        if (!this.spec.includes) {
            this.spec.includes = [];
        }
        const includeSpec = {
            entity,
            fields,
            alias,
        };
        this.spec.includes.push(includeSpec);
        return this;
    }
    // PAGINATION
    page(pageNumber) {
        if (!this.spec.pagination) {
            this.spec.pagination = {};
        }
        this.spec.pagination.page = pageNumber;
        return this;
    }
    pageSize(size) {
        if (!this.spec.pagination) {
            this.spec.pagination = {};
        }
        this.spec.pagination.pageSize = size;
        return this;
    }
    limit(count) {
        return this.pageSize(count);
    }
    offset(count) {
        if (!this.spec.pagination) {
            this.spec.pagination = {};
        }
        const pageSize = this.spec.pagination.pageSize || 50;
        this.spec.pagination.page = Math.floor(count / pageSize) + 1;
        return this;
    }
    cursor(cursorValue) {
        if (!this.spec.pagination) {
            this.spec.pagination = {};
        }
        this.spec.pagination.cursor = cursorValue;
        this.spec.pagination.useCursor = true;
        return this;
    }
    // EXECUTION
    async execute(options) {
        const startTime = Date.now();
        try {
            this.logger.debug('Executing query', {
                entity: this.entityName,
                endpoint: this.endpoint,
                spec: this.spec,
                options,
            });
            // Convert query spec to Autotask API parameters
            const params = this.buildApiParams();
            // Execute the request
            const response = await this.axios.get(this.endpoint, { params });
            const executionTime = Date.now() - startTime;
            // Build metadata from response
            const metadata = {
                executionTime,
                fromCache: false,
                ...this.extractMetadataFromResponse(response),
            };
            const result = {
                data: response.data,
                metadata,
            };
            this.logger.debug('Query executed successfully', {
                entity: this.entityName,
                resultCount: result.data.length,
                executionTime,
                metadata,
            });
            return result;
        }
        catch (error) {
            this.logger.error('Query execution failed', {
                entity: this.entityName,
                endpoint: this.endpoint,
                spec: this.spec,
                error: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    async first(options) {
        const originalPageSize = this.spec.pagination?.pageSize;
        this.pageSize(1);
        const result = await this.execute(options);
        // Restore original page size
        if (originalPageSize !== undefined) {
            this.pageSize(originalPageSize);
        }
        return result.data.length > 0 ? result.data[0] : null;
    }
    async count(options) {
        // For count queries, we typically need to use a different endpoint or parameter
        // This is a simplified implementation - actual implementation would depend on Autotask API
        const result = await this.execute(options);
        return result.metadata.totalCount || result.data.length;
    }
    async exists(options) {
        const result = await this.first(options);
        return result !== null;
    }
    // UTILITY METHODS
    toQuerySpec() {
        return JSON.parse(JSON.stringify(this.spec));
    }
    clone() {
        const cloned = new QueryBuilder(this.axios, this.logger, this.endpoint, this.entityName);
        cloned.spec = JSON.parse(JSON.stringify(this.spec));
        cloned.currentGroup = JSON.parse(JSON.stringify(this.currentGroup));
        cloned.groupStack = JSON.parse(JSON.stringify(this.groupStack));
        return cloned;
    }
    reset() {
        this.spec = {};
        this.currentGroup = { operator: 'and', conditions: [] };
        this.groupStack = [];
        this.spec.filters = this.currentGroup;
        return this;
    }
    // PRIVATE HELPER METHODS
    buildApiParams() {
        const params = {};
        // Build filter string
        if (this.spec.filters && this.spec.filters.conditions.length > 0) {
            params.search = this.buildFilterString(this.spec.filters);
        }
        // Build sort string
        if (this.spec.sorts && this.spec.sorts.length > 0) {
            params.sort = this.spec.sorts
                .map(sort => `${sort.field} ${sort.direction}`)
                .join(',');
        }
        // Build field selection
        if (this.spec.fields && this.spec.fields.length > 0) {
            params.fields = this.spec.fields.join(',');
        }
        // Build includes
        if (this.spec.includes && this.spec.includes.length > 0) {
            params.include = this.spec.includes
                .map(inc => (inc.alias ? `${inc.entity} as ${inc.alias}` : inc.entity))
                .join(',');
        }
        // Build pagination
        if (this.spec.pagination) {
            if (this.spec.pagination.useCursor && this.spec.pagination.cursor) {
                params.cursor = this.spec.pagination.cursor;
            }
            else {
                if (this.spec.pagination.page) {
                    params.page = this.spec.pagination.page;
                }
                if (this.spec.pagination.pageSize) {
                    params.pageSize = this.spec.pagination.pageSize;
                }
            }
        }
        return params;
    }
    buildFilterString(group) {
        const conditions = group.conditions.map(condition => {
            if ('operator' in condition && 'conditions' in condition) {
                // It's a nested group
                return `(${this.buildFilterString(condition)})`;
            }
            else {
                // It's a filter condition
                const filterCondition = condition;
                return this.buildConditionString(filterCondition);
            }
        });
        return conditions.join(` ${group.operator.toUpperCase()} `);
    }
    buildConditionString(condition) {
        const { field, operator, value, values } = condition;
        switch (operator) {
            case 'eq':
                return `${field} eq ${this.formatValue(value)}`;
            case 'ne':
                return `${field} ne ${this.formatValue(value)}`;
            case 'gt':
                return `${field} gt ${this.formatValue(value)}`;
            case 'gte':
                return `${field} gte ${this.formatValue(value)}`;
            case 'lt':
                return `${field} lt ${this.formatValue(value)}`;
            case 'lte':
                return `${field} lte ${this.formatValue(value)}`;
            case 'contains':
                return `${field} contains ${this.formatValue(value)}`;
            case 'startsWith':
                return `${field} beginsWith ${this.formatValue(value)}`;
            case 'endsWith':
                return `${field} endsWith ${this.formatValue(value)}`;
            case 'in':
                return `${field} in (${values?.map(v => this.formatValue(v)).join(',')})`;
            case 'notIn':
                return `${field} notIn (${values?.map(v => this.formatValue(v)).join(',')})`;
            case 'isNull':
                return `${field} eq null`;
            case 'isNotNull':
                return `${field} ne null`;
            case 'between':
                return `${field} gte ${this.formatValue(values?.[0])} AND ${field} lte ${this.formatValue(values?.[1])}`;
            default:
                throw new Error(`Unsupported operator: ${operator}`);
        }
    }
    formatValue(value) {
        if (value === null || value === undefined) {
            return 'null';
        }
        if (typeof value === 'string') {
            return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
        }
        if (value instanceof Date) {
            return `'${value.toISOString()}'`;
        }
        return String(value);
    }
    extractMetadataFromResponse(response) {
        // Extract metadata from Autotask API response headers or body
        // This is a simplified implementation - actual implementation would depend on Autotask API response format
        const metadata = {};
        // Check for pagination headers
        if (response.headers) {
            if (response.headers['x-total-count']) {
                metadata.totalCount = parseInt(response.headers['x-total-count'], 10);
            }
            if (response.headers['x-page-count']) {
                metadata.pageCount = parseInt(response.headers['x-page-count'], 10);
            }
            if (response.headers['x-current-page']) {
                metadata.currentPage = parseInt(response.headers['x-current-page'], 10);
            }
            if (response.headers['x-page-size']) {
                metadata.pageSize = parseInt(response.headers['x-page-size'], 10);
            }
        }
        // Calculate pagination flags
        if (metadata.currentPage && metadata.pageCount) {
            metadata.hasNextPage = metadata.currentPage < metadata.pageCount;
            metadata.hasPreviousPage = metadata.currentPage > 1;
        }
        return metadata;
    }
}
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=queryBuilder.js.map