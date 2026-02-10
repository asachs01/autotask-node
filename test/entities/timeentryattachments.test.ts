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
  let setup: EntityTestSetup<TimeEntryAttachments>;

  beforeEach(() => {
    setup = createEntityTestSetup(TimeEntryAttachments);
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

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TimeEntryAttachments/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: ITimeEntryAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TimeEntryAttachments/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'eq', field: 'name', value: 'test' }),
          ]),
          sort: 'id',
          page: 1,
          maxRecords: 10,
        })
      );
    });
  });

  describe('get', () => {
    it('should get timeentryattachments by id', async () => {
      const mockData = { id: 1, name: 'Test TimeEntryAttachments' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith(
        '/TimeEntryAttachments/1'
      );
    });
  });

  describe('create', () => {
    it('should create timeentryattachments successfully', async () => {
      const timeEntryAttachmentsData = { name: 'New TimeEntryAttachments' };
      const mockResponse = { id: 1, ...timeEntryAttachmentsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(timeEntryAttachmentsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TimeEntryAttachments',
        timeEntryAttachmentsData
      );
    });
  });

  describe('delete', () => {
    it('should delete timeentryattachments successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith(
        '/TimeEntryAttachments/1'
      );
    });
  });
});
