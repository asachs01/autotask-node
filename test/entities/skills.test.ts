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
  Skills,
  ISkills,
  ISkillsQuery,
} from '../../src/entities/skills';

describe('Skills Entity', () => {
  let setup: EntityTestSetup<Skills>;

  beforeEach(() => {
    setup = createEntityTestSetup(Skills);
  });

  afterEach(() => {
    resetAllMocks(setup);
  });

  describe('list', () => {
    it('should list skills successfully', async () => {
      const mockData = [
        { id: 1, name: 'Skills 1' },
        { id: 2, name: 'Skills 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await setup.entity.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Skills/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
      });
    });

    it('should handle query parameters', async () => {
      const query: ISkillsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await setup.entity.list(query);

      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Skills/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
        sort: 'id', page: 1, MaxRecords: 10,
      });
    });
  });

  describe('get', () => {
    it('should get skills by id', async () => {
      const mockData = { id: 1, name: 'Test Skills' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await setup.entity.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/Skills/1');
    });
  });

  describe('create', () => {
    it('should create skills successfully', async () => {
      const skillsData = { name: 'New Skills' };
      const mockResponse = { id: 1, ...skillsData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await setup.entity.create(skillsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/Skills', skillsData);
    });
  });

  describe('update', () => {
    it('should update skills successfully', async () => {
      const skillsData = { name: 'Updated Skills' };
      const mockResponse = { id: 1, ...skillsData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.update(1, skillsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/Skills/1', skillsData);
    });
  });

  describe('patch', () => {
    it('should partially update skills successfully', async () => {
      const skillsData = { name: 'Patched Skills' };
      const mockResponse = { id: 1, ...skillsData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await setup.entity.patch(1, skillsData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/Skills/1', skillsData);
    });
  });

  describe('delete', () => {
    it('should delete skills successfully', async () => {
      setup.mockAxios.delete.mockResolvedValueOnce(
        createMockDeleteResponse()
      );

      await setup.entity.delete(1);

      expect(setup.mockAxios.delete).toHaveBeenCalledWith('/Skills/1');
    });
  });
});