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
  ContractNotes,
  IContractNotes,
  IContractNotesQuery,
} from '../../src/entities/contractnotes';

describe('ContractNotes Entity', () => {
  let contractNotes: ContractNotes;
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

    contractNotes = new ContractNotes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractnotes successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractNotes 1' },
        { id: 2, name: 'ContractNotes 2' },
      ];

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse(mockData)
      );

      const result = await contractNotes.list();

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractNotes/query', {
        filter: [{ op: 'gte', field: 'id', value: 0 }]
        });
    });

    it('should handle query parameters', async () => {
      const query: IContractNotesQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemsResponse([])
      );

      await contractNotes.list(query);

      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractNotes/query', {
        filter: [{ op: 'eq', field: 'name', value: 'test' }],
          sort: 'id',
        page: 1,
        MaxRecords: 10,
        });
    });
  });

  describe('get', () => {
    it('should get contractnotes by id', async () => {
      const mockData = { id: 1, name: 'Test ContractNotes' };

      setup.mockAxios.get.mockResolvedValueOnce(
        createMockItemResponse(mockData)
      );

      const result = await contractNotes.get(1);

      expect(result.data).toEqual(mockData);
      expect(setup.mockAxios.get).toHaveBeenCalledWith('/ContractNotes/1');
    });
  });

  describe('create', () => {
    it('should create contractnotes successfully', async () => {
      const contractNotesData = { name: 'New ContractNotes' };
      const mockResponse = { id: 1, ...contractNotesData };

      setup.mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractNotes.create(contractNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.post).toHaveBeenCalledWith('/ContractNotes', contractNotesData);
    });
  });

  describe('update', () => {
    it('should update contractnotes successfully', async () => {
      const contractNotesData = { name: 'Updated ContractNotes' };
      const mockResponse = { id: 1, ...contractNotesData };

      setup.mockAxios.put.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractNotes.update(1, contractNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.put).toHaveBeenCalledWith('/ContractNotes/1', contractNotesData);
    });
  });

  describe('patch', () => {
    it('should partially update contractnotes successfully', async () => {
      const contractNotesData = { name: 'Patched ContractNotes' };
      const mockResponse = { id: 1, ...contractNotesData };

      setup.mockAxios.patch.mockResolvedValueOnce(
        createMockItemResponse(mockResponse)
      );

      const result = await contractNotes.patch(1, contractNotesData);

      expect(result.data).toEqual(mockResponse);
      expect(setup.mockAxios.patch).toHaveBeenCalledWith('/ContractNotes/1', contractNotesData);
    });
  });
});