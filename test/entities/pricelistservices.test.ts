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
  PriceListServices,
  IPriceListServices,
  IPriceListServicesQuery,
} from '../../src/entities/pricelistservices';
import {
  createEntityTestSetup,
  createMockItemResponse,
  createMockItemsResponse,
  resetAllMocks,
  EntityTestSetup,
} from '../helpers/mockHelper';

describe('PriceListServices Entity', () => {
  let setup: EntityTestSetup<PriceListServices>;

  beforeEach(() => {
    setup = createEntityTestSetup(PriceListServices);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list pricelistservices successfully', async () => {
      const mockData = [
        { id: 1, name: 'PriceListServices 1' },
        { id: 2, name: 'PriceListServices 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/PriceListServices/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
      });
    });

    it('should handle query parameters', async () => {
      const query: IPriceListServicesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/PriceListServices/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id', page: 1, MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get pricelistservices by id', async () => {
      const mockData = { id: 1, name: 'Test PriceListServices' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/PriceListServices/1');
    });
  });

  describe('create', () => {
    it('should create pricelistservices successfully', async () => {
      const priceListServicesData = { name: 'New PriceListServices' };
      const mockResponse = { id: 1, ...priceListServicesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(priceListServicesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/PriceListServices', priceListServicesData);
    });
  });

  describe('update', () => {
    it('should update pricelistservices successfully', async () => {
      const priceListServicesData = { name: 'Updated PriceListServices' };
      const mockResponse = { id: 1, ...priceListServicesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, priceListServicesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/PriceListServices/1', priceListServicesData);
    });
  });

  describe('patch', () => {
    it('should partially update pricelistservices successfully', async () => {
      const priceListServicesData = { name: 'Patched PriceListServices' };
      const mockResponse = { id: 1, ...priceListServicesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, priceListServicesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/PriceListServices/1', priceListServicesData);
    });
  });

  describe('delete', () => {
    it('should delete pricelistservices successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/PriceListServices/1');
    });
  });
});