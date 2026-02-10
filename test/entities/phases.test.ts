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
import { Phases, IPhases, IPhasesQuery } from '../../src/entities/phases';

describe('Phases Entity', () => {
  let setup: EntityTestSetup<Phases>;

  beforeEach(() => {
    setup = createEntityTestSetup(Phases);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list phases successfully', async () => {
      const mockData = [
        { id: 1, name: 'Phases 1' },
        { id: 2, name: 'Phases 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Phases/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }],
      });
    });

    it('should handle query parameters', async () => {
      const query: IPhasesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Phases/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id',
        page: 1,
        maxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get phases by id', async () => {
      const mockData = { id: 1, name: 'Test Phases' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Phases/1');
    });
  });

  describe('create', () => {
    it('should create phases successfully', async () => {
      const phasesData = { name: 'New Phases' };
      const mockResponse = { id: 1, ...phasesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(phasesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Phases', phasesData);
    });
  });

  describe('update', () => {
    it('should update phases successfully', async () => {
      const phasesData = { name: 'Updated Phases' };
      const mockResponse = { id: 1, ...phasesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, phasesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/Phases/1', phasesData);
    });
  });

  describe('patch', () => {
    it('should partially update phases successfully', async () => {
      const phasesData = { name: 'Patched Phases' };
      const mockResponse = { id: 1, ...phasesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, phasesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith(
        '/Phases/1',
        phasesData
      );
    });
  });

  describe('delete', () => {
    it('should delete phases successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/Phases/1');
    });
  });
});
