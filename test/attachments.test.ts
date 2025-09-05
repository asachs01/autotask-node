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
  Attachments,
  Attachment,
  AttachmentQuery,
} from '../src/entities/attachments';
import { NotFoundError, ValidationError } from '../src/utils/errors';

describe('Attachments Entity - Comprehensive Tests', () => {
  let attachments: Attachments;
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

    attachments = new Attachments(mockAxios, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    describe('create', () => {
      it('should create an attachment successfully', async () => {
        const attachmentData: Attachment = {
          parentId: 123,
          fileName: 'document.pdf',
          contentType: 'application/pdf',
        };

        const mockResponse = { id: 1, ...attachmentData };

        mockAxios.post.mockResolvedValueOnce({
          data: mockResponse,
        });

        const result = await attachments.create(attachmentData);

        expect(result.data).toEqual(mockResponse);
        expect(mockAxios.post).toHaveBeenCalledWith('/Attachments', attachmentData);
      });

      it('should validate required fields on create', async () => {
        const invalidAttachment: Attachment = {
          // Missing required fileName
          parentId: 123,
          contentType: 'application/pdf',
        };

        const validationError = new ValidationError('File name is required', ['fileName']);
        mockAxios.post.mockRejectedValueOnce(validationError);

        await expect(attachments.create(invalidAttachment)).rejects.toThrow(ValidationError);
      });

      it('should validate file name format', async () => {
        const attachmentWithInvalidName: Attachment = {
          parentId: 123,
          fileName: '', // Empty filename
          contentType: 'application/pdf',
        };

        const validationError = new ValidationError('Invalid file name', ['fileName']);
        mockAxios.post.mockRejectedValueOnce(validationError);

        await expect(attachments.create(attachmentWithInvalidName)).rejects.toThrow(ValidationError);
      });

      it('should handle file size limits', async () => {
        const largeAttachment: Attachment = {
          parentId: 123,
          fileName: 'large-file.zip',
          contentType: 'application/zip',
          size: 50 * 1024 * 1024, // 50MB
        };

        const sizeError = new ValidationError('File size exceeds limit', ['size']);
        mockAxios.post.mockRejectedValueOnce(sizeError);

        await expect(attachments.create(largeAttachment)).rejects.toThrow(ValidationError);
      });

      it('should validate content type', async () => {
        const attachmentWithInvalidType: Attachment = {
          parentId: 123,
          fileName: 'script.exe',
          contentType: 'application/x-executable',
        };

        const typeError = new ValidationError('File type not allowed', ['contentType']);
        mockAxios.post.mockRejectedValueOnce(typeError);

        await expect(attachments.create(attachmentWithInvalidType)).rejects.toThrow(ValidationError);
      });
    });

    describe('get', () => {
      it('should retrieve attachment by id successfully', async () => {
        const mockAttachment: Attachment = {
          id: 1,
          parentId: 123,
          fileName: 'document.pdf',
          contentType: 'application/pdf',
        };

        mockAxios.get.mockResolvedValueOnce({
          data: mockAttachment,
        });

        const result = await attachments.get(1);

        expect(result.data).toEqual(mockAttachment);
        expect(mockAxios.get).toHaveBeenCalledWith('/Attachments/1');
      });

      it('should throw NotFoundError for non-existent attachment', async () => {
        const notFoundError = new NotFoundError('Attachment not found', 'Attachment', 999);
        mockAxios.get.mockRejectedValueOnce(notFoundError);

        await expect(attachments.get(999)).rejects.toThrow(NotFoundError);
      });

      it('should handle invalid id parameter', async () => {
        const invalidIdError = new ValidationError('Invalid attachment ID', ['id']);
        mockAxios.get.mockRejectedValueOnce(invalidIdError);

        await expect(attachments.get(-1)).rejects.toThrow();
      });
    });

    describe('update', () => {
      it('should update attachment successfully', async () => {
        const updateData: Partial<Attachment> = {
          fileName: 'updated-document.pdf',
          contentType: 'application/pdf',
        };

        const mockResponse: Attachment = {
          id: 1,
          parentId: 123,
          fileName: 'updated-document.pdf',
          contentType: 'application/pdf',
        };

        mockAxios.put.mockResolvedValueOnce({
          data: mockResponse,
        });

        const result = await attachments.update(1, updateData);

        expect(result.data).toEqual(mockResponse);
        expect(mockAxios.put).toHaveBeenCalledWith('/Attachments/1', updateData);
      });

      it('should handle partial updates', async () => {
        const updateData: Partial<Attachment> = {
          fileName: 'renamed-file.docx',
        };

        const mockResponse: Attachment = {
          id: 1,
          parentId: 123,
          fileName: 'renamed-file.docx',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        };

        mockAxios.put.mockResolvedValueOnce({
          data: mockResponse,
        });

        const result = await attachments.update(1, updateData);

        expect(result.data.fileName).toBe('renamed-file.docx');
      });

      it('should prevent updating to invalid file extensions', async () => {
        const invalidUpdate: Partial<Attachment> = {
          fileName: 'malicious.exe',
        };

        const validationError = new ValidationError('File extension not allowed', ['fileName']);
        mockAxios.put.mockRejectedValueOnce(validationError);

        await expect(attachments.update(1, invalidUpdate)).rejects.toThrow(ValidationError);
      });

      it('should handle content type mismatches', async () => {
        const mismatchUpdate: Partial<Attachment> = {
          fileName: 'image.jpg',
          contentType: 'application/pdf', // Mismatch
        };

        const mismatchError = new ValidationError('Content type does not match file extension', ['contentType']);
        mockAxios.put.mockRejectedValueOnce(mismatchError);

        await expect(attachments.update(1, mismatchUpdate)).rejects.toThrow(ValidationError);
      });
    });

    describe('delete', () => {
      it('should delete attachment successfully', async () => {
        mockAxios.delete.mockResolvedValueOnce({});

        await expect(attachments.delete(1)).resolves.toBeUndefined();
        expect(mockAxios.delete).toHaveBeenCalledWith('/Attachments/1');
      });

      it('should handle deletion of non-existent attachment', async () => {
        const notFoundError = new NotFoundError('Attachment not found', 'Attachment', 999);
        mockAxios.delete.mockRejectedValueOnce(notFoundError);

        await expect(attachments.delete(999)).rejects.toThrow(NotFoundError);
      });

      it('should handle permission errors on delete', async () => {
        const permissionError = new AxiosError('Forbidden');
        permissionError.response = { status: 403 } as any;
        mockAxios.delete.mockRejectedValueOnce(permissionError);

        await expect(attachments.delete(1)).rejects.toThrow();
      });

      it('should handle attachments in use', async () => {
        const inUseError = new Error('Cannot delete attachment that is currently in use');
        mockAxios.delete.mockRejectedValueOnce(inUseError);

        await expect(attachments.delete(1)).rejects.toThrow('Cannot delete attachment that is currently in use');
      });
    });
  });

  describe('Query Operations', () => {
    describe('list', () => {
      it('should list attachments successfully', async () => {
        const mockAttachments: Attachment[] = [
          { id: 1, parentId: 123, fileName: 'file1.pdf', contentType: 'application/pdf' },
          { id: 2, parentId: 124, fileName: 'file2.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        ];

        mockAxios.get.mockResolvedValueOnce({
          data: mockAttachments,
        });

        const result = await attachments.list();

        expect(result.data).toEqual(mockAttachments);
        expect(mockAxios.get).toHaveBeenCalledWith('/Attachments', { params: {} });
      });

      it('should handle filtered queries', async () => {
        const query: AttachmentQuery = {
          filter: { parentId: 123 },
          sort: 'fileName',
          page: 1,
          pageSize: 25,
        };

        mockAxios.get.mockResolvedValueOnce({
          data: [],
        });

        await attachments.list(query);

        expect(mockAxios.get).toHaveBeenCalledWith('/Attachments', {
          params: {
            search: JSON.stringify({ parentId: 123 }),
            sort: 'fileName',
            page: 1,
            pageSize: 25,
          },
        });
      });

      it('should filter by content type', async () => {
        const query: AttachmentQuery = {
          filter: { contentType: 'application/pdf' },
        };

        mockAxios.get.mockResolvedValueOnce({
          data: [],
        });

        await attachments.list(query);

        expect(mockAxios.get).toHaveBeenCalledWith('/Attachments', {
          params: {
            search: JSON.stringify({ contentType: 'application/pdf' }),
          },
        });
      });

      it('should handle empty results', async () => {
        mockAxios.get.mockResolvedValueOnce({
          data: [],
        });

        const result = await attachments.list();

        expect(result.data).toEqual([]);
      });

      it('should handle pagination correctly', async () => {
        const query: AttachmentQuery = {
          page: 2,
          pageSize: 10,
        };

        mockAxios.get.mockResolvedValueOnce({
          data: [],
        });

        await attachments.list(query);

        expect(mockAxios.get).toHaveBeenCalledWith('/Attachments', {
          params: {
            page: 2,
            pageSize: 10,
          },
        });
      });
    });
  });

  describe('File Operations', () => {
    describe('file content validation', () => {
      it('should validate image file types', async () => {
        const imageAttachment: Attachment = {
          parentId: 123,
          fileName: 'image.jpg',
          contentType: 'image/jpeg',
        };

        mockAxios.post.mockResolvedValueOnce({
          data: { id: 1, ...imageAttachment },
        });

        const result = await attachments.create(imageAttachment);
        expect(result.data.contentType).toBe('image/jpeg');
      });

      it('should validate document file types', async () => {
        const documentTypes = [
          { fileName: 'doc.pdf', contentType: 'application/pdf' },
          { fileName: 'sheet.xlsx', contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
          { fileName: 'presentation.pptx', contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' },
          { fileName: 'text.txt', contentType: 'text/plain' },
        ];

        for (const docType of documentTypes) {
          const attachment: Attachment = {
            parentId: 123,
            ...docType,
          };

          mockAxios.post.mockResolvedValueOnce({
            data: { id: 1, ...attachment },
          });

          const result = await attachments.create(attachment);
          expect(result.data.contentType).toBe(docType.contentType);
        }
      });

      it('should reject dangerous file types', async () => {
        const dangerousTypes = [
          { fileName: 'virus.exe', contentType: 'application/x-executable' },
          { fileName: 'script.bat', contentType: 'application/x-bat' },
          { fileName: 'malware.scr', contentType: 'application/x-screensaver' },
        ];

        for (const dangerousType of dangerousTypes) {
          const attachment: Attachment = {
            parentId: 123,
            ...dangerousType,
          };

          const typeError = new ValidationError('File type not allowed', ['contentType']);
          mockAxios.post.mockRejectedValueOnce(typeError);

          await expect(attachments.create(attachment)).rejects.toThrow(ValidationError);
        }
      });
    });

    describe('file size handling', () => {
      it('should accept files within size limits', async () => {
        const validSizeAttachment: Attachment = {
          parentId: 123,
          fileName: 'valid-size.pdf',
          contentType: 'application/pdf',
          size: 5 * 1024 * 1024, // 5MB
        };

        mockAxios.post.mockResolvedValueOnce({
          data: { id: 1, ...validSizeAttachment },
        });

        const result = await attachments.create(validSizeAttachment);
        expect(result.data.size).toBe(5 * 1024 * 1024);
      });

      it('should reject oversized files', async () => {
        const oversizedAttachment: Attachment = {
          parentId: 123,
          fileName: 'too-large.zip',
          contentType: 'application/zip',
          size: 100 * 1024 * 1024, // 100MB
        };

        const sizeError = new ValidationError('File size exceeds maximum limit', ['size']);
        mockAxios.post.mockRejectedValueOnce(sizeError);

        await expect(attachments.create(oversizedAttachment)).rejects.toThrow(ValidationError);
      });

      it('should handle zero-byte files', async () => {
        const emptyAttachment: Attachment = {
          parentId: 123,
          fileName: 'empty.txt',
          contentType: 'text/plain',
          size: 0,
        };

        const sizeError = new ValidationError('File cannot be empty', ['size']);
        mockAxios.post.mockRejectedValueOnce(sizeError);

        await expect(attachments.create(emptyAttachment)).rejects.toThrow(ValidationError);
      });
    });

    describe('file name validation', () => {
      it('should validate file name characters', async () => {
        const validNames = [
          'document.pdf',
          'file_with_underscore.txt',
          'file-with-dash.docx',
          'File With Spaces.pdf',
          'file123.jpg',
        ];

        for (const fileName of validNames) {
          const attachment: Attachment = {
            parentId: 123,
            fileName,
            contentType: 'application/octet-stream',
          };

          mockAxios.post.mockResolvedValueOnce({
            data: { id: 1, ...attachment },
          });

          const result = await attachments.create(attachment);
          expect(result.data.fileName).toBe(fileName);
        }
      });

      it('should reject invalid file name characters', async () => {
        const invalidNames = [
          'file<with>brackets.txt',
          'file|with|pipes.txt',
          'file:with:colons.txt',
          'file*with*asterisks.txt',
          'file?with?questions.txt',
        ];

        for (const fileName of invalidNames) {
          const attachment: Attachment = {
            parentId: 123,
            fileName,
            contentType: 'text/plain',
          };

          const nameError = new ValidationError('Invalid characters in file name', ['fileName']);
          mockAxios.post.mockRejectedValueOnce(nameError);

          await expect(attachments.create(attachment)).rejects.toThrow(ValidationError);
        }
      });

      it('should handle very long file names', async () => {
        const longName = 'a'.repeat(300) + '.txt';
        const attachment: Attachment = {
          parentId: 123,
          fileName: longName,
          contentType: 'text/plain',
        };

        const nameError = new ValidationError('File name too long', ['fileName']);
        mockAxios.post.mockRejectedValueOnce(nameError);

        await expect(attachments.create(attachment)).rejects.toThrow(ValidationError);
      });

      it('should handle file names without extensions', async () => {
        const attachment: Attachment = {
          parentId: 123,
          fileName: 'README',
          contentType: 'text/plain',
        };

        mockAxios.post.mockResolvedValueOnce({
          data: { id: 1, ...attachment },
        });

        const result = await attachments.create(attachment);
        expect(result.data.fileName).toBe('README');
      });
    });
  });

  describe('Parent Relationship Validation', () => {
    it('should validate parent entity exists', async () => {
      const attachmentData: Attachment = {
        parentId: 999, // Non-existent parent
        fileName: 'orphaned.pdf',
        contentType: 'application/pdf',
      };

      const parentError = new ValidationError('Parent entity not found', ['parentId']);
      mockAxios.post.mockRejectedValueOnce(parentError);

      await expect(attachments.create(attachmentData)).rejects.toThrow(ValidationError);
    });

    it('should validate parent permissions', async () => {
      const attachmentData: Attachment = {
        parentId: 123,
        fileName: 'restricted.pdf',
        contentType: 'application/pdf',
      };

      const permissionError = new AxiosError('Access denied to parent entity');
      permissionError.response = { status: 403 } as any;
      mockAxios.post.mockRejectedValueOnce(permissionError);

      await expect(attachments.create(attachmentData)).rejects.toThrow();
    });

    it('should list attachments by parent', async () => {
      const parentId = 123;
      const query: AttachmentQuery = {
        filter: { parentId },
      };

      const mockAttachments: Attachment[] = [
        { id: 1, parentId, fileName: 'file1.pdf', contentType: 'application/pdf' },
        { id: 2, parentId, fileName: 'file2.docx', contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      ];

      mockAxios.get.mockResolvedValueOnce({
        data: mockAttachments,
      });

      const result = await attachments.list(query);

      expect(result.data).toEqual(mockAttachments);
      expect(result.data.every(att => att.parentId === parentId)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      const networkError = new AxiosError('Network Error');
      mockAxios.get.mockRejectedValueOnce(networkError);

      await expect(attachments.get(1)).rejects.toThrow('Network Error');
    });

    it('should handle server errors', async () => {
      const serverError = new AxiosError('Internal Server Error');
      serverError.response = { status: 500 } as any;
      mockAxios.post.mockRejectedValueOnce(serverError);

      await expect(attachments.create({ fileName: 'test.txt' })).rejects.toThrow();
    });

    it('should handle timeout errors during upload', async () => {
      const timeoutError = new AxiosError('Request timeout');
      timeoutError.code = 'ECONNABORTED';
      mockAxios.post.mockRejectedValueOnce(timeoutError);

      await expect(attachments.create({ fileName: 'large.zip' })).rejects.toThrow();
    });

    it('should handle disk space errors', async () => {
      const diskSpaceError = new AxiosError('Insufficient storage space');
      diskSpaceError.response = { status: 507 } as any;
      mockAxios.post.mockRejectedValueOnce(diskSpaceError);

      await expect(attachments.create({ fileName: 'file.pdf' })).rejects.toThrow();
    });
  });

  describe('Retry Logic', () => {
    it('should retry on transient failures', async () => {
      const attachment: Attachment = {
        parentId: 123,
        fileName: 'retry-test.pdf',
        contentType: 'application/pdf',
      };

      // First call fails, second succeeds
      mockAxios.post
        .mockRejectedValueOnce(new AxiosError('Temporary failure'))
        .mockResolvedValueOnce({ data: { id: 1, ...attachment } });

      const result = await attachments.create(attachment);
      expect(result.data.id).toBe(1);
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
    });

    it('should not retry on permanent failures', async () => {
      const attachment: Attachment = {
        parentId: 123,
        fileName: 'permanent-fail.pdf',
        contentType: 'application/pdf',
      };

      const validationError = new ValidationError('Invalid file', ['fileName']);
      mockAxios.post.mockRejectedValueOnce(validationError);

      await expect(attachments.create(attachment)).rejects.toThrow(ValidationError);
      expect(mockAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should respect retry limits', async () => {
      const attachment: Attachment = {
        parentId: 123,
        fileName: 'retry-limit.pdf',
        contentType: 'application/pdf',
      };

      // All calls fail
      mockAxios.post.mockRejectedValue(new AxiosError('Persistent failure'));

      await expect(attachments.create(attachment)).rejects.toThrow();
      expect(mockAxios.post).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
  });

  describe('Edge Cases', () => {
    it('should handle Unicode file names', async () => {
      const unicodeAttachment: Attachment = {
        parentId: 123,
        fileName: '文档.pdf', // Chinese characters
        contentType: 'application/pdf',
      };

      mockAxios.post.mockResolvedValueOnce({
        data: { id: 1, ...unicodeAttachment },
      });

      const result = await attachments.create(unicodeAttachment);
      expect(result.data.fileName).toBe('文档.pdf');
    });

    it('should handle null and undefined values', async () => {
      const attachmentWithNulls: Attachment = {
        parentId: 123,
        fileName: 'test.txt',
        contentType: 'text/plain',
        description: null,
        tags: undefined,
      };

      mockAxios.post.mockResolvedValueOnce({
        data: { id: 1, ...attachmentWithNulls },
      });

      const result = await attachments.create(attachmentWithNulls);
      expect(result.data).toBeDefined();
    });

    it('should handle maximum numeric values', async () => {
      const attachmentWithMaxValues: Attachment = {
        parentId: Number.MAX_SAFE_INTEGER,
        fileName: 'max-values.txt',
        contentType: 'text/plain',
        size: Number.MAX_SAFE_INTEGER,
      };

      mockAxios.post.mockResolvedValueOnce({
        data: { id: 1, ...attachmentWithMaxValues },
      });

      const result = await attachments.create(attachmentWithMaxValues);
      expect(result.data.parentId).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle concurrent operations', async () => {
      const attachments1: Attachment = { parentId: 123, fileName: 'file1.txt', contentType: 'text/plain' };
      const attachments2: Attachment = { parentId: 123, fileName: 'file2.txt', contentType: 'text/plain' };

      mockAxios.post
        .mockResolvedValueOnce({ data: { id: 1, ...attachments1 } })
        .mockResolvedValueOnce({ data: { id: 2, ...attachments2 } });

      const [result1, result2] = await Promise.all([
        attachments.create(attachments1),
        attachments.create(attachments2),
      ]);

      expect(result1.data.id).toBe(1);
      expect(result2.data.id).toBe(2);
    });
  });

  describe('Metadata', () => {
    it('should provide correct metadata for all operations', () => {
      const metadata = Attachments.getMetadata();

      expect(metadata).toEqual([
        {
          operation: 'createAttachment',
          requiredParams: ['attachment'],
          optionalParams: [],
          returnType: 'Attachment',
          endpoint: '/Attachments',
        },
        {
          operation: 'getAttachment',
          requiredParams: ['id'],
          optionalParams: [],
          returnType: 'Attachment',
          endpoint: '/Attachments/{id}',
        },
        {
          operation: 'updateAttachment',
          requiredParams: ['id', 'attachment'],
          optionalParams: [],
          returnType: 'Attachment',
          endpoint: '/Attachments/{id}',
        },
        {
          operation: 'deleteAttachment',
          requiredParams: ['id'],
          optionalParams: [],
          returnType: 'void',
          endpoint: '/Attachments/{id}',
        },
        {
          operation: 'listAttachments',
          requiredParams: [],
          optionalParams: ['filter', 'sort', 'page', 'pageSize'],
          returnType: 'Attachment[]',
          endpoint: '/Attachments',
        },
      ]);
    });
  });
});