import { describe, it, expect, beforeEach } from '@jest/globals';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { QueryBuilder } from '../../src/utils/queryBuilder';
import { ComparisonOperator } from '../../src/types/queryBuilder';
import { IQueryBuilder, SortDirection } from '../../src/types/queryBuilder';
import { createMockAxios, createMockLogger } from '../utils/testHelpers';

describe('QueryBuilder', () => {
  let queryBuilder: IQueryBuilder<any>;
  let mockAxios: any;
  let mockLogger: any;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    queryBuilder = new QueryBuilder(
      mockAxios,
      mockLogger,
      '/test-endpoint',
      'TestEntity'
    );
  });

  describe('Basic WHERE conditions', () => {
    it('should build simple equality condition', () => {
      queryBuilder.where('name', 'eq', 'test');
      const spec = queryBuilder.toQuerySpec();

      expect(spec.filters?.conditions).toHaveLength(1);
      expect(spec.filters?.conditions[0]).toEqual({
        field: 'name',
        operator: 'eq',
        value: 'test',
      });
    });

    it('should build multiple conditions with AND', () => {
      queryBuilder
        .where('name', 'eq', 'test')
        .where('status', 'ne', 'inactive');

      const spec = queryBuilder.toQuerySpec();
      expect(spec.filters?.conditions).toHaveLength(2);
      expect(spec.filters?.operator).toBe('and');
    });

    it('should support all comparison operators', () => {
      const operators: ComparisonOperator[] = [
        'eq',
        'ne',
        'gt',
        'gte',
        'lt',
        'lte',
        'contains',
        'startsWith',
        'endsWith',
        'isNull',
        'isNotNull',
      ];

      operators.forEach(op => {
        const builder = new QueryBuilder(
          mockAxios,
          mockLogger,
          '/test',
          'Test'
        );
        builder.where('field', op, 'value');
        const spec = builder.toQuerySpec();

        expect(spec.filters?.conditions[0]).toEqual({
          field: 'field',
          operator: op,
          value: 'value',
        });
      });
    });
  });

  describe('Array-based WHERE conditions', () => {
    it('should build IN condition', () => {
      queryBuilder.whereIn('status', ['active', 'pending']);
      const spec = queryBuilder.toQuerySpec();

      expect(spec.filters?.conditions[0]).toEqual({
        field: 'status',
        operator: 'in',
        values: ['active', 'pending'],
      });
    });

    it('should build NOT IN condition', () => {
      queryBuilder.whereNotIn('type', ['deleted', 'archived']);
      const spec = queryBuilder.toQuerySpec();

      expect(spec.filters?.conditions[0]).toEqual({
        field: 'type',
        operator: 'notIn',
        values: ['deleted', 'archived'],
      });
    });

    it('should build BETWEEN condition', () => {
      queryBuilder.whereBetween('createdDate', '2024-01-01', '2024-12-31');
      const spec = queryBuilder.toQuerySpec();

      expect(spec.filters?.conditions[0]).toEqual({
        field: 'createdDate',
        operator: 'between',
        values: ['2024-01-01', '2024-12-31'],
      });
    });
  });

  describe('NULL conditions', () => {
    it('should build IS NULL condition', () => {
      queryBuilder.whereNull('deletedAt');
      const spec = queryBuilder.toQuerySpec();

      expect(spec.filters?.conditions[0]).toEqual({
        field: 'deletedAt',
        operator: 'isNull',
      });
    });

    it('should build IS NOT NULL condition', () => {
      queryBuilder.whereNotNull('assignedTo');
      const spec = queryBuilder.toQuerySpec();

      expect(spec.filters?.conditions[0]).toEqual({
        field: 'assignedTo',
        operator: 'isNotNull',
      });
    });
  });

  describe('Logical grouping', () => {
    it('should create AND groups', () => {
      queryBuilder.where('status', 'eq', 'active').and(builder => {
        builder.where('priority', 'eq', 'high').where('assignee', 'ne', null);
      });

      const spec = queryBuilder.toQuerySpec();
      expect(spec.filters?.conditions).toHaveLength(2);
      expect(spec.filters?.conditions[1]).toMatchObject({
        operator: 'and',
        conditions: expect.arrayContaining([
          { field: 'priority', operator: 'eq', value: 'high' },
          { field: 'assignee', operator: 'ne', value: null },
        ]),
      });
    });

    it('should create OR groups', () => {
      queryBuilder.where('status', 'eq', 'active').or(builder => {
        builder
          .where('priority', 'eq', 'critical')
          .where('escalated', 'eq', true);
      });

      const spec = queryBuilder.toQuerySpec();
      expect(spec.filters?.conditions).toHaveLength(2);
      expect(spec.filters?.conditions[1]).toMatchObject({
        operator: 'or',
        conditions: expect.arrayContaining([
          { field: 'priority', operator: 'eq', value: 'critical' },
          { field: 'escalated', operator: 'eq', value: true },
        ]),
      });
    });

    it('should handle nested groups', () => {
      queryBuilder.where('accountId', 'eq', 123).and(builder => {
        builder.where('priority', 'eq', 1).or(subBuilder => {
          subBuilder
            .where('status', 'eq', 'open')
            .where('estimatedHours', 'gt', 10);
        });
      });

      const spec = queryBuilder.toQuerySpec();
      expect(spec.filters?.conditions).toHaveLength(2);

      const nestedGroup = spec.filters?.conditions[1] as any;
      expect(nestedGroup.operator).toBe('and');
      expect(nestedGroup.conditions).toHaveLength(2);

      const innerOrGroup = nestedGroup.conditions[1];
      expect(innerOrGroup.operator).toBe('or');
      expect(innerOrGroup.conditions).toHaveLength(2);
    });
  });

  describe('Sorting', () => {
    it('should add single sort field', () => {
      queryBuilder.orderBy('createdDate', 'desc');
      const spec = queryBuilder.toQuerySpec();

      expect(spec.sorts).toEqual([{ field: 'createdDate', direction: 'desc' }]);
    });

    it('should add multiple sort fields', () => {
      queryBuilder.orderBy('priority', 'asc').orderBy('createdDate', 'desc');

      const spec = queryBuilder.toQuerySpec();
      expect(spec.sorts).toEqual([
        { field: 'priority', direction: 'asc' },
        { field: 'createdDate', direction: 'desc' },
      ]);
    });

    it('should default to ascending order', () => {
      queryBuilder.orderBy('name');
      const spec = queryBuilder.toQuerySpec();

      expect(spec.sorts?.[0]).toEqual({
        field: 'name',
        direction: 'asc',
      });
    });

    it('should support orderByDesc shorthand', () => {
      queryBuilder.orderByDesc('updatedAt');
      const spec = queryBuilder.toQuerySpec();

      expect(spec.sorts?.[0]).toEqual({
        field: 'updatedAt',
        direction: 'desc',
      });
    });
  });

  describe('Field selection', () => {
    it('should select specific fields', () => {
      queryBuilder.select('id', 'name', 'status');
      const spec = queryBuilder.toQuerySpec();

      expect(spec.fields).toEqual(['id', 'name', 'status']);
    });

    it('should replace previous field selection', () => {
      queryBuilder.select('id', 'name').select('status', 'priority');

      const spec = queryBuilder.toQuerySpec();
      expect(spec.fields).toEqual(['status', 'priority']);
    });
  });

  describe('Includes (related entities)', () => {
    it('should include related entity', () => {
      queryBuilder.include('Account');
      const spec = queryBuilder.toQuerySpec();

      expect(spec.includes).toEqual([{ entity: 'Account' }]);
    });

    it('should include with specific fields', () => {
      queryBuilder.include('Account', ['name', 'email']);
      const spec = queryBuilder.toQuerySpec();

      expect(spec.includes).toEqual([
        { entity: 'Account', fields: ['name', 'email'] },
      ]);
    });

    it('should include with alias', () => {
      queryBuilder.include(
        'AssignedResource',
        ['firstName', 'lastName'],
        'assignee'
      );
      const spec = queryBuilder.toQuerySpec();

      expect(spec.includes).toEqual([
        {
          entity: 'AssignedResource',
          fields: ['firstName', 'lastName'],
          alias: 'assignee',
        },
      ]);
    });

    it('should include multiple entities', () => {
      queryBuilder.include('Account').include('AssignedResource', ['name']);

      const spec = queryBuilder.toQuerySpec();
      expect(spec.includes).toHaveLength(2);
    });
  });

  describe('Pagination', () => {
    it('should set page number', () => {
      queryBuilder.page(3);
      const spec = queryBuilder.toQuerySpec();

      expect(spec.pagination?.page).toBe(3);
    });

    it('should set page size', () => {
      queryBuilder.pageSize(25);
      const spec = queryBuilder.toQuerySpec();

      expect(spec.pagination?.pageSize).toBe(25);
    });

    it('should set limit (alias for pageSize)', () => {
      queryBuilder.limit(50);
      const spec = queryBuilder.toQuerySpec();

      expect(spec.pagination?.pageSize).toBe(50);
    });

    it('should calculate page from offset', () => {
      queryBuilder.pageSize(20).offset(40);
      const spec = queryBuilder.toQuerySpec();

      expect(spec.pagination?.page).toBe(3); // offset 40 / pageSize 20 + 1
    });

    it('should set cursor for cursor-based pagination', () => {
      queryBuilder.cursor('abc123');
      const spec = queryBuilder.toQuerySpec();

      expect(spec.pagination?.cursor).toBe('abc123');
      expect(spec.pagination?.useCursor).toBe(true);
    });
  });

  describe('Query execution', () => {
    beforeEach(() => {
      mockAxios.get.mockResolvedValue({
        data: [{ id: 1, name: 'Test' }],
        headers: {
          'x-total-count': '100',
          'x-current-page': '1',
          'x-page-size': '50',
        },
      });
    });

    it('should execute query and return results', async () => {
      queryBuilder.where('status', 'eq', 'active');
      const result = await queryBuilder.execute();

      expect(mockAxios.get).toHaveBeenCalledWith('/test-endpoint', {
        params: expect.objectContaining({
          search: "status eq 'active'",
        }),
      });

      expect(result.data).toEqual([{ id: 1, name: 'Test' }]);
      expect(result.metadata.totalCount).toBe(100);
    });

    it('should execute first() and return single result', async () => {
      const result = await queryBuilder.first();

      expect(mockAxios.get).toHaveBeenCalledWith('/test-endpoint', {
        params: expect.objectContaining({
          pageSize: 1,
        }),
      });

      expect(result).toEqual({ id: 1, name: 'Test' });
    });

    it('should return null for first() when no results', async () => {
      mockAxios.get.mockResolvedValue({ data: [] });

      const result = await queryBuilder.first();
      expect(result).toBeNull();
    });

    it('should execute count() and return count', async () => {
      const count = await queryBuilder.count();
      expect(count).toBe(100); // From x-total-count header
    });

    it('should execute exists() and return boolean', async () => {
      const exists = await queryBuilder.exists();
      expect(exists).toBe(true);

      mockAxios.get.mockResolvedValue({ data: [] });
      const notExists = await queryBuilder.exists();
      expect(notExists).toBe(false);
    });
  });

  describe('API parameter building', () => {
    it('should build search parameter from filters', () => {
      const builder = new QueryBuilder(mockAxios, mockLogger, '/test', 'Test');
      builder.where('status', 'eq', 'active').where('priority', 'gt', 1);

      const params = (builder as any).buildApiParams();
      expect(params.search).toBe("status eq 'active' AND priority gt 1");
    });

    it('should build sort parameter', () => {
      const builder = new QueryBuilder(mockAxios, mockLogger, '/test', 'Test');
      builder.orderBy('priority', 'desc').orderBy('createdDate', 'asc');

      const params = (builder as any).buildApiParams();
      expect(params.sort).toBe('priority desc,createdDate asc');
    });

    it('should build fields parameter', () => {
      const builder = new QueryBuilder(mockAxios, mockLogger, '/test', 'Test');
      builder.select('id', 'name', 'status');

      const params = (builder as any).buildApiParams();
      expect(params.fields).toBe('id,name,status');
    });

    it('should build include parameter', () => {
      const builder = new QueryBuilder(mockAxios, mockLogger, '/test', 'Test');
      builder.include('Account').include('Resource', undefined, 'assignee');

      const params = (builder as any).buildApiParams();
      expect(params.include).toBe('Account,Resource as assignee');
    });

    it('should build pagination parameters', () => {
      const builder = new QueryBuilder(mockAxios, mockLogger, '/test', 'Test');
      builder.page(2).pageSize(25);

      const params = (builder as any).buildApiParams();
      expect(params.page).toBe(2);
      expect(params.pageSize).toBe(25);
    });

    it('should build cursor parameter', () => {
      const builder = new QueryBuilder(mockAxios, mockLogger, '/test', 'Test');
      builder.cursor('abc123');

      const params = (builder as any).buildApiParams();
      expect(params.cursor).toBe('abc123');
      expect(params.page).toBeUndefined();
    });
  });

  describe('Value formatting', () => {
    it('should format string values with quotes', () => {
      const builder = new QueryBuilder(mockAxios, mockLogger, '/test', 'Test');
      const formatted = (builder as any).formatValue('test string');
      expect(formatted).toBe("'test string'");
    });

    it('should escape single quotes in strings', () => {
      const builder = new QueryBuilder(mockAxios, mockLogger, '/test', 'Test');
      const formatted = (builder as any).formatValue("test's string");
      expect(formatted).toBe("'test''s string'");
    });

    it('should format dates as ISO strings', () => {
      const builder = new QueryBuilder(mockAxios, mockLogger, '/test', 'Test');
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = (builder as any).formatValue(date);
      expect(formatted).toBe("'2024-01-15T10:30:00.000Z'");
    });

    it('should format null values', () => {
      const builder = new QueryBuilder(mockAxios, mockLogger, '/test', 'Test');
      expect((builder as any).formatValue(null)).toBe('null');
      expect((builder as any).formatValue(undefined)).toBe('null');
    });

    it('should format numbers as strings', () => {
      const builder = new QueryBuilder(mockAxios, mockLogger, '/test', 'Test');
      expect((builder as any).formatValue(123)).toBe('123');
      expect((builder as any).formatValue(45.67)).toBe('45.67');
    });
  });

  describe('Utility methods', () => {
    it('should clone query builder', () => {
      queryBuilder
        .where('status', 'eq', 'active')
        .orderBy('createdDate', 'desc');

      const cloned = queryBuilder.clone();
      const originalSpec = queryBuilder.toQuerySpec();
      const clonedSpec = cloned.toQuerySpec();

      expect(clonedSpec).toEqual(originalSpec);

      // Verify they are independent
      cloned.where('priority', 'eq', 'high');
      expect(queryBuilder.toQuerySpec()).toEqual(originalSpec);
    });

    it('should reset query builder', () => {
      queryBuilder
        .where('status', 'eq', 'active')
        .orderBy('createdDate', 'desc')
        .select('id', 'name');

      queryBuilder.reset();
      const spec = queryBuilder.toQuerySpec();

      expect(spec.filters?.conditions).toHaveLength(0);
      expect(spec.sorts).toBeUndefined();
      expect(spec.fields).toBeUndefined();
    });
  });

  describe('Error handling', () => {
    it('should handle API errors during execution', async () => {
      const error = new Error('API Error');
      mockAxios.get.mockRejectedValue(error);

      await expect(queryBuilder.execute()).rejects.toThrow('API Error');
    });

    it('should throw error for unsupported operators', () => {
      const builder = new QueryBuilder(mockAxios, mockLogger, '/test', 'Test');
      expect(() => {
        (builder as any).buildConditionString({
          field: 'test',
          operator: 'unsupported' as any,
          value: 'value',
        });
      }).toThrow('Unsupported operator: unsupported');
    });
  });
});
