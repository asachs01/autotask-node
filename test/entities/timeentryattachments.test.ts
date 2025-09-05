import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';
import {
  TimeEntryAttachments,
  ITimeEntryAttachments,
  ITimeEntryAttachmentsQuery,
} from '../../src/entities/timeentryattachments';

describe('TimeEntryAttachments Entity', () => {
  let setup: EntityTestSetup<describe>;

  beforeEach(() => {
    setup = createEntityTestSetup(describe);
  });

    timeEntryAttachments = new TimeEntryAttachments(mockAxios, mockLogger);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list timeentryattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'TimeEntryAttachments 1' },
        { id: 2, name: 'TimeEntryAttachments 2' },
      ];

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(setup.entity.data).toEqual(mockData);
      expect(setup.setup.mockAxios.get).toHaveBeenCalledWith('/TimeEntryAttachments/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: ITimeEntryAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.setup.mockAxios.get).toHaveBeenCalledWith('/TimeEntryAttachments/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get timeentryattachments by id', async () => {
      const mockData = { id: 1, name: 'Test TimeEntryAttachments' };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(setup.entity.data).toEqual(mockData);
      expect(setup.setup.mockAxios.get).toHaveBeenCalledWith('/TimeEntryAttachments/1');
    });
  });

  describe('create', () => {
    it('should create timeentryattachments successfully', async () => {
      const timeEntryAttachmentsData = { name: 'New TimeEntryAttachments' };
      const mockResponse = { id: 1, ...timeEntryAttachmentsData };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(timeEntryAttachmentsData);

      expect(setup.entity.data).toEqual(mockResponse);
      expect(setup.setup.mockAxios.post).toHaveBeenCalledWith('/TimeEntryAttachments', timeEntryAttachmentsData);
    });
  });

  describe('delete', () => {
    it('should delete timeentryattachments successfully', async () => {
      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await setup.entity.delete(1);

      expect(setup.setup.mockAxios.delete).toHaveBeenCalledWith('/TimeEntryAttachments/1');
    });
  });
});