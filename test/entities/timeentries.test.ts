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
  TimeEntries,
  ITimeEntries,
  ITimeEntriesQuery,
} from '../../src/entities/timeentries';

describe('TimeEntries Entity', () => {
  let setup: EntityTestSetup<TimeEntries>;

  beforeEach(() => {
    setup = createEntityTestSetup(TimeEntries);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list timeentries successfully', async () => {
      const mockData = [
        { id: 1, name: 'TimeEntries 1' },
        { id: 2, name: 'TimeEntries 2' },
      ];

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TimeEntries/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: ITimeEntriesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.get.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TimeEntries/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get timeentries by id', async () => {
      const mockData = { id: 1, name: 'Test TimeEntries' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TimeEntries/1');
    });
  });

  describe('create', () => {
    it('should create timeentries successfully', async () => {
      const timeEntriesData = { name: 'New TimeEntries' };
      const mockResponse = { id: 1, ...timeEntriesData };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(321, timeEntriesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/Tickets/321/TimeEntries',
        timeEntriesData
      );
    });
  });

  describe('update', () => {
    it('should update timeentries successfully', async () => {
      const timeEntriesData = { name: 'Updated TimeEntries' };
      const mockResponse = { id: 1, ...timeEntriesData };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, timeEntriesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith(
        '/TimeEntries/1',
        timeEntriesData
      );
    });
  });

  describe('patch', () => {
    it('should partially update timeentries successfully', async () => {
      const timeEntriesData = { name: 'Patched TimeEntries' };
      const mockResponse = { id: 1, ...timeEntriesData };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, timeEntriesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/TimeEntries/1',
        timeEntriesData
      );
    });
  });

  describe('delete', () => {
    it('should delete timeentries successfully', async () => {
      setup.mockAxios.get.mockResolvedValueOnce(createMockDeleteResponse());

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/TimeEntries/1');
    });
  });
});
