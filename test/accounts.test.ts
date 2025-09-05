import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import winston from 'winston';
import {
  Accounts,
  Account,
  AccountQuery,
} from '../src/entities/accounts';
import { BusinessRuleEngine } from '../src/business-rules/BusinessRuleEngine';
import { ReferentialIntegrityManager } from '../src/referential-integrity/ReferentialIntegrityManager';
import { NotFoundError, ValidationError } from '../src/utils/errors';
import { RequestHandler } from '../src/utils/requestHandler';

describe('Accounts Entity - Comprehensive Tests', () => {
  let accounts: Accounts;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: winston.Logger;
  let mockBusinessRules: jest.Mocked<BusinessRuleEngine>;
  let mockIntegrityManager: jest.Mocked<ReferentialIntegrityManager>;
  let mockRequestHandler: jest.Mocked<RequestHandler>;

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

    mockBusinessRules = {
      validateEntity: jest.fn(),
      registerRule: jest.fn(),
    } as any;

    mockIntegrityManager = {
      validateReferences: jest.fn(),
      checkConstraints: jest.fn(),
    } as any;

    mockRequestHandler = {
      executeRequest: jest.fn(),
    } as any;

    accounts = new Accounts(mockAxios, mockLogger, mockRequestHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    describe('create', () => {
      it('should create an account successfully', async () => {
        const accountData: Account = {
          companyName: 'Test Company',
          companyType: 1,
          phone: '123-456-7890',
          city: 'New York',
          isActive: true,
        };

        const mockResponse = { id: 1, ...accountData };

        mockRequestHandler.executeRequest.mockResolvedValueOnce({
          data: { item: mockResponse },
        });

        const result = await accounts.create(accountData);

        expect(result.data).toEqual(mockResponse);
        expect(mockRequestHandler.executeRequest).toHaveBeenCalledWith(
          expect.any(Function),
          '/Companies',
          'POST'
        );
      });

      it('should validate required fields on create', async () => {
        const invalidAccount: Account = {
          // Missing required companyName
          phone: '123-456-7890',
        };

        const validationError = new ValidationError('Company name is required', ['companyName']);
        mockRequestHandler.executeRequest.mockRejectedValueOnce(validationError);

        await expect(accounts.create(invalidAccount)).rejects.toThrow(ValidationError);
      });

      it('should handle duplicate account creation', async () => {
        const accountData: Account = {
          companyName: 'Existing Company',
        };

        const duplicateError = new Error('Company already exists');
        mockRequestHandler.executeRequest.mockRejectedValueOnce(duplicateError);

        await expect(accounts.create(accountData)).rejects.toThrow('Company already exists');
      });
    });

    describe('get', () => {
      it('should retrieve account by id successfully', async () => {
        const mockAccount: Account = {
          id: 1,
          companyName: 'Test Company',
          companyType: 1,
          phone: '123-456-7890',
          isActive: true,
        };

        mockRequestHandler.executeRequest.mockResolvedValueOnce({
          data: { item: mockAccount },
        });

        const result = await accounts.get(1);

        expect(result.data).toEqual(mockAccount);
        expect(mockRequestHandler.executeRequest).toHaveBeenCalledWith(
          expect.any(Function),
          '/Companies/1',
          'GET'
        );
      });

      it('should throw NotFoundError for non-existent account', async () => {
        const notFoundError = new NotFoundError('Account not found', 'Account', 999);
        mockRequestHandler.executeRequest.mockRejectedValueOnce(notFoundError);

        await expect(accounts.get(999)).rejects.toThrow(NotFoundError);
      });

      it('should handle invalid id parameter', async () => {
        await expect(accounts.get(-1)).rejects.toThrow();
        await expect(accounts.get(0)).rejects.toThrow();
      });
    });

    describe('update', () => {
      it('should update account successfully', async () => {
        const updateData: Partial<Account> = {
          companyName: 'Updated Company',
          phone: '999-888-7777',
        };

        const mockResponse: Account = {
          id: 1,
          companyName: 'Updated Company',
          phone: '999-888-7777',
          isActive: true,
        };

        mockRequestHandler.executeRequest.mockResolvedValueOnce({
          data: { item: mockResponse },
        });

        const result = await accounts.update(1, updateData);

        expect(result.data).toEqual(mockResponse);
        expect(mockRequestHandler.executeRequest).toHaveBeenCalledWith(
          expect.any(Function),
          '/Companies/1',
          'PUT'
        );
      });

      it('should handle partial updates', async () => {
        const updateData: Partial<Account> = {
          phone: '555-123-4567',
        };

        const mockResponse: Account = {
          id: 1,
          companyName: 'Existing Company',
          phone: '555-123-4567',
          isActive: true,
        };

        mockRequestHandler.executeRequest.mockResolvedValueOnce({
          data: { item: mockResponse },
        });

        const result = await accounts.update(1, updateData);

        expect(result.data.phone).toBe('555-123-4567');
      });

      it('should validate update data', async () => {
        const invalidUpdate: Partial<Account> = {
          companyType: -1, // Invalid type
        };

        const validationError = new ValidationError('Invalid company type', ['companyType']);
        mockRequestHandler.executeRequest.mockRejectedValueOnce(validationError);

        await expect(accounts.update(1, invalidUpdate)).rejects.toThrow(ValidationError);
      });
    });

    describe('delete', () => {
      it('should delete account successfully', async () => {
        mockRequestHandler.executeRequest.mockResolvedValueOnce({
          data: {},
        });

        await expect(accounts.delete(1)).resolves.toBeUndefined();
        expect(mockRequestHandler.executeRequest).toHaveBeenCalledWith(
          expect.any(Function),
          '/Companies/1',
          'DELETE'
        );
      });

      it('should handle deletion of non-existent account', async () => {
        const notFoundError = new NotFoundError('Account not found', 'Account', 999);
        mockRequestHandler.executeRequest.mockRejectedValueOnce(notFoundError);

        await expect(accounts.delete(999)).rejects.toThrow(NotFoundError);
      });

      it('should handle referential integrity constraints', async () => {
        const constraintError = new Error('Cannot delete account with active contracts');
        mockRequestHandler.executeRequest.mockRejectedValueOnce(constraintError);

        await expect(accounts.delete(1)).rejects.toThrow('Cannot delete account with active contracts');
      });
    });
  });

  describe('Query Operations', () => {
    describe('list', () => {
      it('should list accounts with default filter', async () => {
        const mockAccounts: Account[] = [
          { id: 1, companyName: 'Company A', isActive: true },
          { id: 2, companyName: 'Company B', isActive: true },
        ];

        mockRequestHandler.executeRequest.mockResolvedValueOnce({
          data: { items: mockAccounts },
        });

        const result = await accounts.list();

        expect(result.data).toEqual(mockAccounts);
        expect(mockRequestHandler.executeRequest).toHaveBeenCalledWith(
          expect.any(Function),
          '/Companies/query',
          'POST'
        );
      });

      it('should handle complex filter queries', async () => {
        const query: AccountQuery = {
          filter: {
            companyName: 'Test',
            isActive: true,
            companyType: { gte: 1 },
          },
          sort: 'companyName',
          page: 2,
          pageSize: 25,
        };

        mockRequestHandler.executeRequest.mockResolvedValueOnce({
          data: { items: [] },
        });

        await accounts.list(query);

        expect(mockRequestHandler.executeRequest).toHaveBeenCalledWith(
          expect.any(Function),
          '/Companies/query',
          'POST'
        );
      });

      it('should handle array filter format', async () => {
        const query: AccountQuery = {
          filter: [
            { op: 'eq', field: 'isActive', value: true },
            { op: 'contains', field: 'companyName', value: 'Tech' },
          ] as any,
        };

        mockRequestHandler.executeRequest.mockResolvedValueOnce({
          data: { items: [] },
        });

        await accounts.list(query);

        expect(mockRequestHandler.executeRequest).toHaveBeenCalledWith(
          expect.any(Function),
          '/Companies/query',
          'POST'
        );
      });

      it('should handle empty results', async () => {
        mockRequestHandler.executeRequest.mockResolvedValueOnce({
          data: { items: [] },
        });

        const result = await accounts.list();

        expect(result.data).toEqual([]);
      });

      it('should handle pagination', async () => {
        const query: AccountQuery = {
          page: 3,
          pageSize: 50,
        };

        mockRequestHandler.executeRequest.mockResolvedValueOnce({
          data: { items: [] },
        });

        await accounts.list(query);

        expect(mockRequestHandler.executeRequest).toHaveBeenCalledWith(
          expect.any(Function),
          '/Companies/query',
          'POST'
        );
      });
    });
  });

  describe('Field Validation', () => {
    it('should validate company name requirements', async () => {
      const accountWithoutName: Account = {
        phone: '123-456-7890',
      };

      const validationError = new ValidationError('Company name is required', ['companyName']);
      mockRequestHandler.executeRequest.mockRejectedValueOnce(validationError);

      await expect(accounts.create(accountWithoutName)).rejects.toThrow(ValidationError);
    });

    it('should validate phone number format', async () => {
      const accountWithInvalidPhone: Account = {
        companyName: 'Test Company',
        phone: 'invalid-phone',
      };

      const validationError = new ValidationError('Invalid phone format', ['phone']);
      mockRequestHandler.executeRequest.mockRejectedValueOnce(validationError);

      await expect(accounts.create(accountWithInvalidPhone)).rejects.toThrow(ValidationError);
    });

    it('should validate email format', async () => {
      const accountWithInvalidEmail: Account = {
        companyName: 'Test Company',
        webAddress: 'invalid-email',
      };

      const validationError = new ValidationError('Invalid email format', ['webAddress']);
      mockRequestHandler.executeRequest.mockRejectedValueOnce(validationError);

      await expect(accounts.create(accountWithInvalidEmail)).rejects.toThrow(ValidationError);
    });

    it('should validate required numeric fields', async () => {
      const accountWithInvalidData: Account = {
        companyName: 'Test Company',
        companyType: -1, // Invalid
        currencyID: 'invalid' as any, // Should be number
      };

      const validationError = new ValidationError('Invalid field values', ['companyType', 'currencyID']);
      mockRequestHandler.executeRequest.mockRejectedValueOnce(validationError);

      await expect(accounts.create(accountWithInvalidData)).rejects.toThrow(ValidationError);
    });
  });

  describe('Business Rules Integration', () => {
    it('should apply business rules during creation', async () => {
      const accountData: Account = {
        companyName: 'Test Company',
        isActive: true,
      };

      // Mock business rules validation
      mockBusinessRules.validateEntity.mockResolvedValueOnce({
        isValid: false,
        getErrors: () => [{ code: 'DUPLICATE_COMPANY', message: 'Company name already exists' }],
      } as any);

      mockRequestHandler.executeRequest.mockRejectedValueOnce(
        new ValidationError('Business rule violation', ['companyName'])
      );

      await expect(accounts.create(accountData)).rejects.toThrow(ValidationError);
    });

    it('should enforce territory constraints', async () => {
      const accountData: Account = {
        companyName: 'Test Company',
        territoryID: 999, // Non-existent territory
      };

      const constraintError = new ValidationError('Invalid territory reference', ['territoryID']);
      mockRequestHandler.executeRequest.mockRejectedValueOnce(constraintError);

      await expect(accounts.create(accountData)).rejects.toThrow(ValidationError);
    });
  });

  describe('Relationship Validation', () => {
    it('should validate parent company relationships', async () => {
      const accountData: Account = {
        companyName: 'Subsidiary Company',
        parentCompanyID: 1,
      };

      // Mock referential integrity check
      mockIntegrityManager.validateReferences.mockResolvedValueOnce({
        isValid: false,
        violations: [{ field: 'parentCompanyID', message: 'Parent company does not exist' }],
      } as any);

      mockRequestHandler.executeRequest.mockRejectedValueOnce(
        new ValidationError('Invalid parent company reference', ['parentCompanyID'])
      );

      await expect(accounts.create(accountData)).rejects.toThrow(ValidationError);
    });

    it('should prevent circular parent relationships', async () => {
      const accountData: Account = {
        id: 1,
        companyName: 'Company A',
        parentCompanyID: 1, // Self-reference
      };

      const circularError = new ValidationError('Circular parent reference detected', ['parentCompanyID']);
      mockRequestHandler.executeRequest.mockRejectedValueOnce(circularError);

      await expect(accounts.update(1, accountData)).rejects.toThrow(ValidationError);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new AxiosError('Network Error');
      mockRequestHandler.executeRequest.mockRejectedValueOnce(networkError);

      await expect(accounts.get(1)).rejects.toThrow('Network Error');
    });

    it('should handle rate limiting', async () => {
      const rateLimitError = new AxiosError('Rate limit exceeded');
      rateLimitError.response = { status: 429 } as any;
      
      mockRequestHandler.executeRequest.mockRejectedValueOnce(rateLimitError);

      await expect(accounts.get(1)).rejects.toThrow();
    });

    it('should handle server errors', async () => {
      const serverError = new AxiosError('Internal Server Error');
      serverError.response = { status: 500 } as any;
      
      mockRequestHandler.executeRequest.mockRejectedValueOnce(serverError);

      await expect(accounts.get(1)).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new AxiosError('Request timeout');
      timeoutError.code = 'ECONNABORTED';
      
      mockRequestHandler.executeRequest.mockRejectedValueOnce(timeoutError);

      await expect(accounts.get(1)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long company names', async () => {
      const longName = 'A'.repeat(1000);
      const accountData: Account = {
        companyName: longName,
      };

      const validationError = new ValidationError('Company name too long', ['companyName']);
      mockRequestHandler.executeRequest.mockRejectedValueOnce(validationError);

      await expect(accounts.create(accountData)).rejects.toThrow(ValidationError);
    });

    it('should handle special characters in company names', async () => {
      const accountData: Account = {
        companyName: 'Test & Co. <script>alert("xss")</script>',
      };

      mockRequestHandler.executeRequest.mockResolvedValueOnce({
        data: { item: { id: 1, ...accountData } },
      });

      const result = await accounts.create(accountData);
      expect(result.data.companyName).toContain('Test & Co.');
    });

    it('should handle null and undefined values', async () => {
      const accountData: Account = {
        companyName: 'Test Company',
        fax: null,
        alternatePhone1: undefined,
      };

      mockRequestHandler.executeRequest.mockResolvedValueOnce({
        data: { item: { id: 1, ...accountData } },
      });

      const result = await accounts.create(accountData);
      expect(result.data).toBeDefined();
    });

    it('should handle maximum integer values', async () => {
      const accountData: Account = {
        companyName: 'Test Company',
        ownerResourceID: Number.MAX_SAFE_INTEGER,
      };

      mockRequestHandler.executeRequest.mockResolvedValueOnce({
        data: { item: { id: 1, ...accountData } },
      });

      const result = await accounts.create(accountData);
      expect(result.data.ownerResourceID).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe('Metadata', () => {
    it('should provide correct metadata for all operations', () => {
      const metadata = Accounts.getMetadata();

      expect(metadata).toEqual([
        {
          operation: 'createAccount',
          requiredParams: ['account'],
          optionalParams: [],
          returnType: 'Account',
          endpoint: '/Companies',
        },
        {
          operation: 'getAccount',
          requiredParams: ['id'],
          optionalParams: [],
          returnType: 'Account',
          endpoint: '/Companies/{id}',
        },
        {
          operation: 'updateAccount',
          requiredParams: ['id', 'account'],
          optionalParams: [],
          returnType: 'Account',
          endpoint: '/Companies/{id}',
        },
        {
          operation: 'deleteAccount',
          requiredParams: ['id'],
          optionalParams: [],
          returnType: 'void',
          endpoint: '/Companies/{id}',
        },
        {
          operation: 'listAccounts',
          requiredParams: [],
          optionalParams: ['filter', 'sort', 'page', 'pageSize'],
          returnType: 'Account[]',
          endpoint: '/Companies',
        },
      ]);
    });
  });
});
