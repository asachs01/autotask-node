import { Attachments } from '../src/entities/attachments';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('Attachments', () => {
  let attachments: Attachments;
  let mockAxios: Partial<AxiosInstance>;
  let logger: winston.Logger;

  beforeEach(() => {
    mockAxios = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    } as any;
    logger = winston.createLogger({ transports: [] });
    attachments = new Attachments(mockAxios as AxiosInstance, logger);
  });

  it('should create an attachment', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const res = await attachments.create({ fileName: 'file.txt' });
    expect(res.data.id).toBe(1);
  });

  it('should get an attachment', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: { id: 2 } });
    const res = await attachments.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update an attachment', async () => {
    (mockAxios.put as jest.Mock).mockResolvedValue({ data: { id: 3, fileName: 'updated.txt' } });
    const res = await attachments.update(3, { fileName: 'updated.txt' });
    expect(res.data.fileName).toBe('updated.txt');
  });

  it('should delete an attachment', async () => {
    (mockAxios.delete as jest.Mock).mockResolvedValue({});
    await expect(attachments.delete(4)).resolves.toBeUndefined();
  });

  it('should list attachments', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: [{ id: 5 }] });
    const res = await attachments.list();
    expect(res.data[0].id).toBe(5);
  });
}); 