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

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TimeOffRequests/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: ITimeOffRequestsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.get.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TimeOffRequests/query',
        {
          filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
          page: 1,
          MaxRecords: 10,
        }
      );
    });
  });

  describe('get', () => {
    it('should get timeoffrequests by id', async () => {
      const mockData = { id: 1, name: 'Test TimeOffRequests' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/TimeOffRequests/1');
    });
  });

  describe('create', () => {
    it('should create timeoffrequests successfully', async () => {
      const timeOffRequestsData = { name: 'New TimeOffRequests' };
      const mockResponse = { id: 1, ...timeOffRequestsData };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(timeOffRequestsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TimeOffRequests',
        timeOffRequestsData
      );
    });
  });

  describe('update', () => {
    it('should update timeoffrequests successfully', async () => {
      const timeOffRequestsData = { name: 'Updated TimeOffRequests' };
      const mockResponse = { id: 1, ...timeOffRequestsData };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, timeOffRequestsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith(
        '/TimeOffRequests/1',
        timeOffRequestsData
      );
    });
  });

  describe('patch', () => {
    it('should partially update timeoffrequests successfully', async () => {
      const timeOffRequestsData = { name: 'Patched TimeOffRequests' };
      const mockResponse = { id: 1, ...timeOffRequestsData };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, timeOffRequestsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/TimeOffRequests/1',
        timeOffRequestsData
      );
    });
  });

  describe('delete', () => {
    it('should delete timeoffrequests successfully', async () => {
      setup.mockAxios.get.mockResolvedValueOnce(createMockDeleteResponse());

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/TimeOffRequests/1');
    });
  });
});
