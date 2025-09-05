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
  TimeOffRequests,
  ITimeOffRequests,
  ITimeOffRequestsQuery,
} from '../../src/entities/timeoffrequests';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  createMockDeleteResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';

describe('TimeOffRequests Entity', () => {
  let setup: EntityTestSetup<TimeOffRequests>;

  beforeEach(() => {
    setup = createEntityTestSetup(describe);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list timeoffrequests successfully', async () => {
      const mockData = [
        { id: 1, name: 'TimeOffRequests 1' },
        { id: 2, name: 'TimeOffRequests 2' },
      ];

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.setup.entity.list();

      expect(setup.entity.data).toEqual(mockData);
      expect(setup.setup.mockAxios.post).toHaveBeenCalledWith('/TimeOffRequests/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
      });
    });

    it('should handle query parameters', async () => {
      const query: ITimeOffRequestsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.setup.entity.list(query);

      expect(setup.setup.mockAxios.post).toHaveBeenCalledWith('/TimeOffRequests/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id', page: 1, MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get timeoffrequests by id', async () => {
      const mockData = { id: 1, name: 'Test TimeOffRequests' };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.setup.entity.get(1);

      expect(setup.entity.data).toEqual(mockData);
      expect(setup.setup.mockAxios.get).toHaveBeenCalledWith('/TimeOffRequests/1');
    });
  });

  describe('create', () => {
    it('should create timeoffrequests successfully', async () => {
      const timeOffRequestsData = { name: 'New TimeOffRequests' };
      const mockResponse = { id: 1, ...timeOffRequestsData };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.setup.entity.create(timeOffRequestsData);

      expect(setup.entity.data).toEqual(mockResponse);
      expect(setup.setup.mockAxios.post).toHaveBeenCalledWith('/TimeOffRequests', timeOffRequestsData);
    });
  });

  describe('update', () => {
    it('should update timeoffrequests successfully', async () => {
      const timeOffRequestsData = { name: 'Updated TimeOffRequests' };
      const mockResponse = { id: 1, ...timeOffRequestsData };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.setup.entity.update(1, timeOffRequestsData);

      expect(setup.entity.data).toEqual(mockResponse);
      expect(setup.setup.mockAxios.put).toHaveBeenCalledWith('/TimeOffRequests/1', timeOffRequestsData);
    });
  });

  describe('patch', () => {
    it('should partially update timeoffrequests successfully', async () => {
      const timeOffRequestsData = { name: 'Patched TimeOffRequests' };
      const mockResponse = { id: 1, ...timeOffRequestsData };

      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.setup.entity.patch(1, timeOffRequestsData);

      expect(setup.entity.data).toEqual(mockResponse);
      expect(setup.setup.mockAxios.patch).toHaveBeenCalledWith('/TimeOffRequests/1', timeOffRequestsData);
    });
  });

  describe('delete', () => {
    it('should delete timeoffrequests successfully', async () => {
      setup.setup.mockAxios.setup.entity.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await setup.setup.entity.delete(1);

      expect(setup.setup.mockAxios.delete).toHaveBeenCalledWith('/TimeOffRequests/1');
    });
  });
});