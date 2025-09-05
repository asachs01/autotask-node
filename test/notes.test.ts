import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';
import { AxiosInstance, AxiosError } from 'axios';
import winston from 'winston';
import {
  Notes,
  Note,
  NoteQuery,
} from '../src/entities/notes';
import { BusinessRuleEngine } from '../src/business-rules/BusinessRuleEngine';
import { ReferentialIntegrityManager } from '../src/referential-integrity/ReferentialIntegrityManager';
import { NotFoundError, ValidationError } from '../src/utils/errors';

describe('Notes Entity - Comprehensive Tests', () => {
  let notes: Notes;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: winston.Logger;
  let mockBusinessRules: jest.Mocked<BusinessRuleEngine>;
  let mockIntegrityManager: jest.Mocked<ReferentialIntegrityManager>;

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

    notes = new Notes(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    describe('create', () => {
      it('should create a note successfully', async () => {
        const noteData: Note = {
          ticketId: 123,
          title: 'Important Note',
          description: 'This is a detailed note about the ticket',
        };

        const mockResponse = { id: 1, ...noteData };

        mockAxios.post.mockResolvedValueOnce({
          data: mockResponse,
        });

        const result = await notes.create(noteData);

        expect(result.data).toEqual(mockResponse);
        expect(mockAxios.post).toHaveBeenCalledWith('/Notes', noteData);
      });

      it('should validate required fields on create', async () => {
        const invalidNote: Note = {
          // Missing required title
          ticketId: 123,
          description: 'Note without title',
        };

        const validationError = new ValidationError('Title is required', ['title']);
        mockAxios.post.mockRejectedValueOnce(validationError);

        await expect(notes.create(invalidNote)).rejects.toThrow(ValidationError);
      });

      it('should validate ticket relationship on create', async () => {
        const noteWithInvalidTicket: Note = {
          ticketId: 999, // Non-existent ticket
          title: 'Orphaned Note',
          description: 'This note has no valid parent ticket',
        };

        const relationshipError = new ValidationError('Referenced ticket does not exist', ['ticketId']);
        mockAxios.post.mockRejectedValueOnce(relationshipError);

        await expect(notes.create(noteWithInvalidTicket)).rejects.toThrow(ValidationError);
      });

      it('should handle note creation with rich content', async () => {
        const richNote: Note = {
          ticketId: 123,
          title: 'Rich Content Note',
          description: `
            # Issue Description
            - Problem with **database connection**
            - Error occurred at *2024-01-15 10:30 AM*
            - Affected users: customer@example.com
            
            ## Solution
            1. Restart database service
            2. Clear connection pool
            3. Monitor for 24 hours
          `,
          isPrivate: false,
          createdBy: 'user@company.com',
        };

        mockAxios.post.mockResolvedValueOnce({
          data: { id: 1, ...richNote },
        });

        const result = await notes.create(richNote);
        expect(result.data.description).toContain('# Issue Description');
      });

      it('should create private notes', async () => {
        const privateNote: Note = {
          ticketId: 123,
          title: 'Internal Note',
          description: 'This note is for internal use only',
          isPrivate: true,
        };

        mockAxios.post.mockResolvedValueOnce({
          data: { id: 1, ...privateNote },
        });

        const result = await notes.create(privateNote);
        expect(result.data.isPrivate).toBe(true);
      });
    });

    describe('get', () => {
      it('should retrieve note by id successfully', async () => {
        const mockNote: Note = {
          id: 1,
          ticketId: 123,
          title: 'Test Note',
          description: 'Test note description',
          isPrivate: false,
        };

        mockAxios.get.mockResolvedValueOnce({
          data: mockNote,
        });

        const result = await notes.get(1);

        expect(result.data).toEqual(mockNote);
        expect(mockAxios.get).toHaveBeenCalledWith('/Notes/1');
      });

      it('should throw NotFoundError for non-existent note', async () => {
        const notFoundError = new NotFoundError('Note not found', 'Note', 999);
        mockAxios.get.mockRejectedValueOnce(notFoundError);

        await expect(notes.get(999)).rejects.toThrow(NotFoundError);
      });

      it('should handle permission errors for private notes', async () => {
        const permissionError = new AxiosError('Access denied to private note');
        permissionError.response = { status: 403 } as any;
        mockAxios.get.mockRejectedValueOnce(permissionError);

        await expect(notes.get(1)).rejects.toThrow();
      });

      it('should retrieve note with full metadata', async () => {
        const fullNote: Note = {
          id: 1,
          ticketId: 123,
          title: 'Complete Note',
          description: 'Full note with all metadata',
          isPrivate: false,
          createdBy: 'user@company.com',
          createdDate: '2024-01-15T10:30:00Z',
          lastModifiedBy: 'admin@company.com',
          lastModifiedDate: '2024-01-15T15:45:00Z',
        };

        mockAxios.get.mockResolvedValueOnce({
          data: fullNote,
        });

        const result = await notes.get(1);

        expect(result.data.createdBy).toBe('user@company.com');
        expect(result.data.lastModifiedBy).toBe('admin@company.com');
      });
    });

    describe('update', () => {
      it('should update note successfully', async () => {
        const updateData: Partial<Note> = {
          title: 'Updated Note Title',
          description: 'Updated description with more details',
        };

        const mockResponse: Note = {
          id: 1,
          ticketId: 123,
          title: 'Updated Note Title',
          description: 'Updated description with more details',
          isPrivate: false,
        };

        mockAxios.put.mockResolvedValueOnce({
          data: mockResponse,
        });

        const result = await notes.update(1, updateData);

        expect(result.data).toEqual(mockResponse);
        expect(mockAxios.put).toHaveBeenCalledWith('/Notes/1', updateData);
      });

      it('should handle partial updates', async () => {
        const updateData: Partial<Note> = {
          description: 'Only updating the description',
        };

        const mockResponse: Note = {
          id: 1,
          ticketId: 123,
          title: 'Original Title',
          description: 'Only updating the description',
          isPrivate: false,
        };

        mockAxios.put.mockResolvedValueOnce({
          data: mockResponse,
        });

        const result = await notes.update(1, updateData);

        expect(result.data.description).toBe('Only updating the description');
        expect(result.data.title).toBe('Original Title'); // Should remain unchanged
      });

      it('should validate content length limits', async () => {
        const longContent = 'a'.repeat(10000);
        const invalidUpdate: Partial<Note> = {
          description: longContent,
        };

        const validationError = new ValidationError('Description exceeds maximum length', ['description']);
        mockAxios.put.mockRejectedValueOnce(validationError);

        await expect(notes.update(1, invalidUpdate)).rejects.toThrow(ValidationError);
      });

      it('should prevent changing ticket association', async () => {
        const invalidUpdate: Partial<Note> = {
          ticketId: 456, // Trying to move note to different ticket
        };

        const validationError = new ValidationError('Cannot change note parent ticket', ['ticketId']);
        mockAxios.put.mockRejectedValueOnce(validationError);

        await expect(notes.update(1, invalidUpdate)).rejects.toThrow(ValidationError);
      });

      it('should toggle privacy setting', async () => {
        const privacyUpdate: Partial<Note> = {
          isPrivate: true,
        };

        const mockResponse: Note = {
          id: 1,
          ticketId: 123,
          title: 'Original Title',
          description: 'Original description',
          isPrivate: true,
        };

        mockAxios.put.mockResolvedValueOnce({
          data: mockResponse,
        });

        const result = await notes.update(1, privacyUpdate);

        expect(result.data.isPrivate).toBe(true);
      });
    });

    describe('delete', () => {
      it('should delete note successfully', async () => {
        mockAxios.delete.mockResolvedValueOnce({});

        await expect(notes.delete(1)).resolves.toBeUndefined();
        expect(mockAxios.delete).toHaveBeenCalledWith('/Notes/1');
      });

      it('should handle deletion of non-existent note', async () => {
        const notFoundError = new NotFoundError('Note not found', 'Note', 999);
        mockAxios.delete.mockRejectedValueOnce(notFoundError);

        await expect(notes.delete(999)).rejects.toThrow(NotFoundError);
      });

      it('should handle permission errors on delete', async () => {
        const permissionError = new AxiosError('Insufficient permissions to delete note');
        permissionError.response = { status: 403 } as any;
        mockAxios.delete.mockRejectedValueOnce(permissionError);

        await expect(notes.delete(1)).rejects.toThrow();
      });

      it('should handle referenced note deletion constraints', async () => {
        const constraintError = new Error('Cannot delete note referenced by other entities');
        mockAxios.delete.mockRejectedValueOnce(constraintError);

        await expect(notes.delete(1)).rejects.toThrow('Cannot delete note referenced by other entities');
      });
    });
  });

  describe('Query Operations', () => {
    describe('list', () => {
      it('should list notes successfully', async () => {
        const mockNotes: Note[] = [
          { id: 1, ticketId: 123, title: 'Note 1', description: 'First note' },
          { id: 2, ticketId: 124, title: 'Note 2', description: 'Second note' },
        ];

        mockAxios.get.mockResolvedValueOnce({
          data: mockNotes,
        });

        const result = await notes.list();

        expect(result.data).toEqual(mockNotes);
        expect(mockAxios.get).toHaveBeenCalledWith('/Notes', { params: {} });
      });

      it('should filter notes by ticket', async () => {
        const query: NoteQuery = {
          filter: { ticketId: 123 },
        };

        const ticketNotes: Note[] = [
          { id: 1, ticketId: 123, title: 'Ticket Note 1', description: 'First note for ticket' },
          { id: 2, ticketId: 123, title: 'Ticket Note 2', description: 'Second note for ticket' },
        ];

        mockAxios.get.mockResolvedValueOnce({
          data: ticketNotes,
        });

        const result = await notes.list(query);

        expect(result.data).toEqual(ticketNotes);
        expect(mockAxios.get).toHaveBeenCalledWith('/Notes', {
          params: {
            search: JSON.stringify({ ticketId: 123 }),
          },
        });
      });

      it('should filter private notes', async () => {
        const query: NoteQuery = {
          filter: { isPrivate: false }, // Only public notes
        };

        const publicNotes: Note[] = [
          { id: 1, ticketId: 123, title: 'Public Note', description: 'This is public', isPrivate: false },
        ];

        mockAxios.get.mockResolvedValueOnce({
          data: publicNotes,
        });

        const result = await notes.list(query);

        expect(result.data).toEqual(publicNotes);
        expect(result.data.every(note => note.isPrivate === false)).toBe(true);
      });

      it('should search notes by content', async () => {
        const query: NoteQuery = {
          filter: { description: 'database error' },
        };

        mockAxios.get.mockResolvedValueOnce({
          data: [],
        });

        await notes.list(query);

        expect(mockAxios.get).toHaveBeenCalledWith('/Notes', {
          params: {
            search: JSON.stringify({ description: 'database error' }),
          },
        });
      });

      it('should sort notes by date', async () => {
        const query: NoteQuery = {
          sort: 'createdDate',
          page: 1,
          pageSize: 20,
        };

        mockAxios.get.mockResolvedValueOnce({
          data: [],
        });

        await notes.list(query);

        expect(mockAxios.get).toHaveBeenCalledWith('/Notes', {
          params: {
            sort: 'createdDate',
            page: 1,
            pageSize: 20,
          },
        });
      });

      it('should handle empty results', async () => {
        mockAxios.get.mockResolvedValueOnce({
          data: [],
        });

        const result = await notes.list();

        expect(result.data).toEqual([]);
      });

      it('should handle pagination', async () => {
        const query: NoteQuery = {
          page: 2,
          pageSize: 50,
        };

        mockAxios.get.mockResolvedValueOnce({
          data: [],
        });

        await notes.list(query);

        expect(mockAxios.get).toHaveBeenCalledWith('/Notes', {
          params: {
            page: 2,
            pageSize: 50,
          },
        });
      });
    });
  });

  describe('Relationship Validation', () => {
    it('should validate ticket relationship exists', async () => {
      const noteData: Note = {
        ticketId: 999, // Non-existent ticket
        title: 'Orphaned Note',
        description: 'Note with invalid ticket reference',
      };

      // Mock referential integrity check
      mockIntegrityManager.validateReferences.mockResolvedValueOnce({
        isValid: false,
        violations: [{ field: 'ticketId', message: 'Referenced ticket does not exist' }],
      } as any);

      const referenceError = new ValidationError('Invalid ticket reference', ['ticketId']);
      mockAxios.post.mockRejectedValueOnce(referenceError);

      await expect(notes.create(noteData)).rejects.toThrow(ValidationError);
    });

    it('should validate user permissions for ticket', async () => {
      const noteData: Note = {
        ticketId: 123,
        title: 'Restricted Note',
        description: 'Note for restricted ticket',
      };

      const permissionError = new AxiosError('No access to specified ticket');
      permissionError.response = { status: 403 } as any;
      mockAxios.post.mockRejectedValueOnce(permissionError);

      await expect(notes.create(noteData)).rejects.toThrow();
    });

    it('should validate note ownership for updates', async () => {
      const updateData: Partial<Note> = {
        title: 'Unauthorized Update',
      };

      const ownershipError = new AxiosError('Cannot modify note created by another user');
      ownershipError.response = { status: 403 } as any;
      mockAxios.put.mockRejectedValueOnce(ownershipError);

      await expect(notes.update(1, updateData)).rejects.toThrow();
    });
  });

  describe('Business Rules Integration', () => {
    it('should apply business rules during creation', async () => {
      const noteData: Note = {
        ticketId: 123,
        title: 'Duplicate Note',
        description: 'This note might be a duplicate',
      };

      // Mock business rules validation
      mockBusinessRules.validateEntity.mockResolvedValueOnce({
        isValid: false,
        getErrors: () => [{ code: 'DUPLICATE_NOTE', message: 'Similar note already exists' }],
      } as any);

      const duplicateError = new ValidationError('Business rule violation: duplicate note', ['title']);
      mockAxios.post.mockRejectedValueOnce(duplicateError);

      await expect(notes.create(noteData)).rejects.toThrow(ValidationError);
    });

    it('should enforce note content policies', async () => {
      const noteWithRestrictedContent: Note = {
        ticketId: 123,
        title: 'Sensitive Information',
        description: 'This note contains: SSN 123-45-6789, Credit Card: 4111-1111-1111-1111',
      };

      const policyError = new ValidationError('Note contains sensitive information', ['description']);
      mockAxios.post.mockRejectedValueOnce(policyError);

      await expect(notes.create(noteWithRestrictedContent)).rejects.toThrow(ValidationError);
    });

    it('should validate note visibility rules', async () => {
      const privateNoteData: Note = {
        ticketId: 123,
        title: 'Private Note',
        description: 'This should be private',
        isPrivate: true,
      };

      // Some tickets might not allow private notes
      const visibilityError = new ValidationError('Private notes not allowed for this ticket type', ['isPrivate']);
      mockAxios.post.mockRejectedValueOnce(visibilityError);

      await expect(notes.create(privateNoteData)).rejects.toThrow(ValidationError);
    });
  });

  describe('Content Validation', () => {
    it('should validate title length', async () => {
      const longTitle = 'a'.repeat(1000);
      const noteWithLongTitle: Note = {
        ticketId: 123,
        title: longTitle,
        description: 'Note with very long title',
      };

      const lengthError = new ValidationError('Title exceeds maximum length', ['title']);
      mockAxios.post.mockRejectedValueOnce(lengthError);

      await expect(notes.create(noteWithLongTitle)).rejects.toThrow(ValidationError);
    });

    it('should validate description format', async () => {
      const noteWithInvalidFormat: Note = {
        ticketId: 123,
        title: 'Invalid Format Note',
        description: '<script>alert("xss")</script>', // Potentially dangerous content
      };

      const formatError = new ValidationError('Invalid content format detected', ['description']);
      mockAxios.post.mockRejectedValueOnce(formatError);

      await expect(notes.create(noteWithInvalidFormat)).rejects.toThrow(ValidationError);
    });

    it('should validate required fields', async () => {
      const incompleteNote: Note = {
        ticketId: 123,
        // Missing title
        description: 'Note without title',
      };

      const requiredError = new ValidationError('Title is required', ['title']);
      mockAxios.post.mockRejectedValueOnce(requiredError);

      await expect(notes.create(incompleteNote)).rejects.toThrow(ValidationError);
    });

    it('should handle special characters in content', async () => {
      const noteWithSpecialChars: Note = {
        ticketId: 123,
        title: 'Special Characters: äöü ñ ç 中文 Ѐλληνικά',
        description: 'Content with émojis: 🔧 ⚠️ ✅ and symbols: © ® ™ § ¶',
      };

      mockAxios.post.mockResolvedValueOnce({
        data: { id: 1, ...noteWithSpecialChars },
      });

      const result = await notes.create(noteWithSpecialChars);
      expect(result.data.title).toContain('äöü ñ ç 中文');
      expect(result.data.description).toContain('🔧 ⚠️ ✅');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new AxiosError('Network Error');
      mockAxios.get.mockRejectedValueOnce(networkError);

      await expect(notes.get(1)).rejects.toThrow('Network Error');
    });

    it('should handle server errors', async () => {
      const serverError = new AxiosError('Internal Server Error');
      serverError.response = { status: 500 } as any;
      mockAxios.post.mockRejectedValueOnce(serverError);

      await expect(notes.create({ title: 'Test' })).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new AxiosError('Request timeout');
      timeoutError.code = 'ECONNABORTED';
      mockAxios.put.mockRejectedValueOnce(timeoutError);

      await expect(notes.update(1, { title: 'Updated' })).rejects.toThrow();
    });

    it('should handle rate limiting', async () => {
      const rateLimitError = new AxiosError('Rate limit exceeded');
      rateLimitError.response = { status: 429 } as any;
      mockAxios.get.mockRejectedValueOnce(rateLimitError);

      await expect(notes.list()).rejects.toThrow();
    });
  });

  describe('Retry Logic', () => {
    it('should retry on transient failures', async () => {
      const noteData: Note = {
        ticketId: 123,
        title: 'Retry Test',
        description: 'Testing retry mechanism',
      };

      // First call fails, second succeeds
      mockAxios.post
        .mockRejectedValueOnce(new AxiosError('Temporary failure'))
        .mockResolvedValueOnce({ data: { id: 1, ...noteData } });

      const result = await notes.create(noteData);
      expect(result.data.id).toBe(1);
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should not retry on validation errors', async () => {
      const invalidNote: Note = {
        ticketId: 123,
        title: '',
        description: 'Empty title should not retry',
      };

      const validationError = new ValidationError('Title cannot be empty', ['title']);
      mockAxios.post.mockRejectedValueOnce(validationError);

      await expect(notes.create(invalidNote)).rejects.toThrow(ValidationError);
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should respect retry limits', async () => {
      const noteData: Note = {
        ticketId: 123,
        title: 'Retry Limit Test',
        description: 'Testing retry limits',
      };

      // All calls fail
      mockAxios.post.mockRejectedValue(new AxiosError('Persistent failure'));

      await expect(notes.create(noteData)).rejects.toThrow();
      expect(mockAxios.post).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long descriptions', async () => {
      const longDescription = 'Lorem ipsum '.repeat(1000);
      const noteWithLongContent: Note = {
        ticketId: 123,
        title: 'Long Content Note',
        description: longDescription,
      };

      const lengthError = new ValidationError('Description exceeds maximum length', ['description']);
      mockAxios.post.mockRejectedValueOnce(lengthError);

      await expect(notes.create(noteWithLongContent)).rejects.toThrow(ValidationError);
    });

    it('should handle null and undefined values', async () => {
      const noteWithNulls: Note = {
        ticketId: 123,
        title: 'Note with nulls',
        description: 'Regular description',
        isPrivate: null as any,
        metadata: undefined,
      };

      mockAxios.post.mockResolvedValueOnce({
        data: { id: 1, ...noteWithNulls },
      });

      const result = await notes.create(noteWithNulls);
      expect(result.data).toBeDefined();
    });

    it('should handle maximum integer values', async () => {
      const noteWithMaxValues: Note = {
        ticketId: Number.MAX_SAFE_INTEGER,
        title: 'Max Values Test',
        description: 'Testing maximum values',
      };

      mockAxios.post.mockResolvedValueOnce({
        data: { id: 1, ...noteWithMaxValues },
      });

      const result = await notes.create(noteWithMaxValues);
      expect(result.data.ticketId).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle concurrent note operations', async () => {
      const note1: Note = { ticketId: 123, title: 'Concurrent Note 1', description: 'First note' };
      const note2: Note = { ticketId: 124, title: 'Concurrent Note 2', description: 'Second note' };

      mockAxios.post
        .mockResolvedValueOnce({ data: { id: 1, ...note1 } })
        .mockResolvedValueOnce({ data: { id: 2, ...note2 } });

      const [result1, result2] = await Promise.all([
        notes.create(note1),
        notes.create(note2),
      ]);

      expect(result1.data.id).toBe(1);
      expect(result2.data.id).toBe(2);
    });

    it('should handle notes with rich markdown content', async () => {
      const markdownNote: Note = {
        ticketId: 123,
        title: 'Markdown Note',
        description: `
# Issue Resolution Steps

## Problem Analysis
- **Symptom**: Application timeout
- **Cause**: Database connection pool exhaustion
- **Impact**: ~100 users affected

## Solution Implementation
\`\`\`sql
-- Increased connection pool size
ALTER SYSTEM SET max_connections = 200;
\`\`\`

## Verification
- [x] Connection pool metrics normal
- [x] Application response time < 2s
- [ ] 24-hour monitoring (in progress)

## Links
- [Monitoring Dashboard](http://monitor.example.com)
- [Knowledge Base Article #1234](http://kb.example.com/1234)
        `,
      };

      mockAxios.post.mockResolvedValueOnce({
        data: { id: 1, ...markdownNote },
      });

      const result = await notes.create(markdownNote);
      expect(result.data.description).toContain('# Issue Resolution Steps');
      expect(result.data.description).toContain('```sql');
    });
  });

  describe('Metadata', () => {
    it('should provide correct metadata for all operations', () => {
      const metadata = Notes.getMetadata();

      expect(metadata).toEqual([
        {
          operation: 'createNote',
          requiredParams: ['note'],
          optionalParams: [],
          returnType: 'Note',
          endpoint: '/Notes',
        },
        {
          operation: 'getNote',
          requiredParams: ['id'],
          optionalParams: [],
          returnType: 'Note',
          endpoint: '/Notes/{id}',
        },
        {
          operation: 'updateNote',
          requiredParams: ['id', 'note'],
          optionalParams: [],
          returnType: 'Note',
          endpoint: '/Notes/{id}',
        },
        {
          operation: 'deleteNote',
          requiredParams: ['id'],
          optionalParams: [],
          returnType: 'void',
          endpoint: '/Notes/{id}',
        },
        {
          operation: 'listNotes',
          requiredParams: [],
          optionalParams: ['filter', 'sort', 'page', 'pageSize'],
          returnType: 'Note[]',
          endpoint: '/Notes',
        },
      ]);
    });
  });
});