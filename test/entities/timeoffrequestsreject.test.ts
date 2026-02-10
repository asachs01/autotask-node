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
  TimeOffRequestsReject,
  ITimeOffRequestsReject,
  ITimeOffRequestsRejectQuery,
} from '../../src/entities/timeoffrequestsreject';

describe('TimeOffRequestsReject Entity', () => {
  let setup: EntityTestSetup<TimeOffRequestsReject>;

  beforeEach(() => {
    setup = createEntityTestSetup(TimeOffRequestsReject);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list timeoffrequestsreject successfully', async () => {
      const mockData = [
        { id: 1, name: 'TimeOffRequestsReject 1' },
        { id: 2, name: 'TimeOffRequestsReject 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TimeOffRequestsReject/query',
        expect.objectContaining({
          filter: expect.arrayContaining([
            expect.objectContaining({ op: 'gte', field: 'id', value: 0 }),
          ]),
        })
      );
    });

    it('should handle query parameters', async () => {
      const query: ITimeOffRequestsRejectQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TimeOffRequestsReject/query',
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
    it('should create timeoffrequestsreject successfully', async () => {
      const timeOffRequestsRejectData = { name: 'New TimeOffRequestsReject' };
      const mockResponse = { id: 1, ...timeOffRequestsRejectData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(timeOffRequestsRejectData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/TimeOffRequestsReject',
        timeOffRequestsRejectData
      );
    });
  });
});
