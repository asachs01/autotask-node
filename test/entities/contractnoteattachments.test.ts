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
  ContractNoteAttachments,
  IContractNoteAttachments,
  IContractNoteAttachmentsQuery,
} from '../../src/entities/contractnoteattachments';

describe('ContractNoteAttachments Entity', () => {
  let contractNoteAttachments: ContractNoteAttachments;
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

    contractNoteAttachments = new ContractNoteAttachments(
      mockAxios,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should list contractnoteattachments successfully', async () => {
      const mockData = [
        { id: 1, name: 'ContractNoteAttachments 1' },
        { id: 2, name: 'ContractNoteAttachments 2' },
      ];

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse(mockData));

      const result = await contractNoteAttachments.list();

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ContractNoteAttachments/query',
        {
          filter: [{ op: 'gte', field: 'id', value: 0 }],
        }
      );
    });

    it('should handle query parameters', async () => {
      const query: IContractNoteAttachmentsQuery = {
        filter: { name: 'test' },
        sort: 'id',
        page: 1,
        pageSize: 10,
      };

      mockAxios.post.mockResolvedValueOnce(createMockItemsResponse([]));

      await contractNoteAttachments.list(query);

      expect(mockAxios.get).toHaveBeenCalledWith(
        '/ContractNoteAttachments/query',
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
    it('should get contractnoteattachments by id', async () => {
      const mockData = { id: 1, name: 'Test ContractNoteAttachments' };

      mockAxios.get.mockResolvedValueOnce(createMockItemResponse(mockData));

      const result = await contractNoteAttachments.get(1);

      expect(result.data).toEqual(mockData);
      expect(mockAxios.get).toHaveBeenCalledWith('/ContractNoteAttachments/1');
    });
  });

  describe('create', () => {
    it('should create contractnoteattachments successfully', async () => {
      const contractNoteAttachmentsData = {
        name: 'New ContractNoteAttachments',
      };
      const mockResponse = { id: 1, ...contractNoteAttachmentsData };

      mockAxios.post.mockResolvedValueOnce(
        createMockItemResponse(mockResponse, 201)
      );

      const result = await contractNoteAttachments.create(
        contractNoteAttachmentsData
      );

      expect(result.data).toEqual(mockResponse);
      expect(mockAxios.post).toHaveBeenCalledWith(
        '/ContractNoteAttachments',
        contractNoteAttachmentsData
      );
    });
  });

  describe('delete', () => {
    it('should delete contractnoteattachments successfully', async () => {
      mockAxios.delete.mockResolvedValueOnce(createMockDeleteResponse());

      await contractNoteAttachments.delete(1);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        '/ContractNoteAttachments/1'
      );
    });
  });
});
