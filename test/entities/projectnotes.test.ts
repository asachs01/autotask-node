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
  ProjectNotes,
  IProjectNotes,
  IProjectNotesQuery,
} from '../../src/entities/projectnotes';

describe('ProjectNotes Entity', () => {
  let projectNotes: ProjectNotes;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: winston.Logger;

  beforeEach(() => {
    mockAxios = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: {
          use: jest.fn(),
          eject: jest.fn(),
        },
        response: {
          use: jest.fn(),
          eject: jest.fn(),
        },
      },
    } as any;

    mockLogger = winston.createLogger({
      level: 'error',
      transports: [new winston.transports.Console({ silent: true })],
    });

    projectNotes = new ProjectNotes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list projectnotes successfully', async () => {
      const mockData = [
        { id: 1, name: 'ProjectNotes 1' },
        { id: 2, name: 'ProjectNotes 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await projectNotes.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ProjectNotes/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IProjectNotesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await projectNotes.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ProjectNotes/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get projectnotes by id', async () => {
      const mockData = { id: 1, name: 'Test ProjectNotes' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await projectNotes.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ProjectNotes/1');
    });
  });

  describe('create', () => {
    it('should create projectnotes successfully', async () => {
      const projectNotesData = { name: 'New ProjectNotes' };
      const mockResponse = { id: 1, ...projectNotesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await projectNotes.create(projectNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ProjectNotes', projectNotesData);
    });
  });

  describe('update', () => {
    it('should update projectnotes successfully', async () => {
      const projectNotesData = { name: 'Updated ProjectNotes' };
      const mockResponse = { id: 1, ...projectNotesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await projectNotes.update(1, projectNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ProjectNotes/1', projectNotesData);
    });
  });

  describe('patch', () => {
    it('should partially update projectnotes successfully', async () => {
      const projectNotesData = { name: 'Patched ProjectNotes' };
      const mockResponse = { id: 1, ...projectNotesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await projectNotes.patch(1, projectNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ProjectNotes/1', projectNotesData);
    });
  });
});