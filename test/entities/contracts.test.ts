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
  Contracts,
  IContracts,
  IContractsQuery,
} from '../../src/entities/contracts';

describe('Contracts Entity', () => {
  let setup: EntityTestSetup<Contracts>;

  beforeEach(() => {
    setup = createEntityTestSetup(Contracts);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list contracts successfully', async () => {
      const mockData = [
        { id: 1, name: 'Contracts 1' },
        { id: 2, name: 'Contracts 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Contracts/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
      });
    });

    it('should handle query parameters', async () => {
      const query: IContractsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Contracts/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get contracts by id', async () => {
      const mockData = { id: 1, name: 'Test Contracts' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Contracts/1');
    });
  });

  describe('create', () => {
    it('should create contracts successfully', async () => {
      const contractsData = { name: 'New Contracts' };
      const mockResponse = { id: 1, ...contractsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(contractsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Contracts', contractsData);
    });
  });

  describe('update', () => {
    it('should update contracts successfully', async () => {
      const contractsData = { name: 'Updated Contracts' };
      const mockResponse = { id: 1, ...contractsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, contractsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/Contracts/1', contractsData);
    });
  });

  describe('patch', () => {
    it('should partially update contracts successfully', async () => {
      const contractsData = { name: 'Patched Contracts' };
      const mockResponse = { id: 1, ...contractsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, contractsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/Contracts/1',
        contractsData
      );
    });
  });
});
