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
  TimeOffRequestsApprove,
  ITimeOffRequestsApprove,
  ITimeOffRequestsApproveQuery,
} from '../../src/entities/timeoffrequestsapprove';

describe('TimeOffRequestsApprove Entity', () => {
  let setup: EntityTestSetup<TimeOffRequestsApprove>;

  beforeEach(() => {
    setup = createEntityTestSetup(TimeOffRequestsApprove);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list timeoffrequestsapprove successfully', async () => {
      const mockData = [
        { id: 1, name: 'TimeOffRequestsApprove 1' },
        { id: 2, name: 'TimeOffRequestsApprove 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TimeOffRequestsApprove/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: ITimeOffRequestsApproveQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TimeOffRequestsApprove/query',
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

  describe('create', () => {
    it('should create timeoffrequestsapprove successfully', async () => {
      const timeOffRequestsApproveData = { name: 'New TimeOffRequestsApprove' };
      const mockResponse = { id: 1, ...timeOffRequestsApproveData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(timeOffRequestsApproveData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TimeOffRequestsApprove',
        timeOffRequestsApproveData
      );
    });
  });
});
