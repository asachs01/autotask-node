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
  Holidays,
  IHolidays,
  IHolidaysQuery,
} from '../../src/entities/holidays';

describe('Holidays Entity', () => {
  let setup: EntityTestSetup<Holidays>;

  beforeEach(() => {
    setup = createEntityTestSetup(Holidays);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list holidays successfully', async () => {
      const mockData = [
        { id: 1, name: 'Holidays 1' },
        { id: 2, name: 'Holidays 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Holidays/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IHolidaysQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Holidays/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get holidays by id', async () => {
      const mockData = { id: 1, name: 'Test Holidays' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Holidays/1');
    });
  });

  describe('create', () => {
    it('should create holidays successfully', async () => {
      const holidaysData = { name: 'New Holidays' };
      const mockResponse = { id: 1, ...holidaysData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(holidaysData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith(
        '/Holidays',
        holidaysData
      );
    });
  });

  describe('update', () => {
    it('should update holidays successfully', async () => {
      const holidaysData = { name: 'Updated Holidays' };
      const mockResponse = { id: 1, ...holidaysData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, holidaysData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith(
        '/Holidays/1',
        holidaysData
      );
    });
  });

  describe('patch', () => {
    it('should partially update holidays successfully', async () => {
      const holidaysData = { name: 'Patched Holidays' };
      const mockResponse = { id: 1, ...holidaysData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, holidaysData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/Holidays/1',
        holidaysData
      );
    });
  });

  describe('delete', () => {
    it('should delete holidays successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/Holidays/1');
    });
  });
});
