import { Notes } from '../src/entities/notes';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('Notes', () => {
  let notes: Notes;
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
    notes = new Notes(mockAxios as AxiosInstance, logger);
  });

  it('should create a note', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const res = await notes.create({ title: 'Test Note' });
    expect(res.data.id).toBe(1);
  });

  it('should get a note', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: { id: 2 } });
    const res = await notes.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update a note', async () => {
    (mockAxios.put as jest.Mock).mockResolvedValue({ data: { id: 3, title: 'Updated' } });
    const res = await notes.update(3, { title: 'Updated' });
    expect(res.data.title).toBe('Updated');
  });

  it('should delete a note', async () => {
    (mockAxios.delete as jest.Mock).mockResolvedValue({});
    await expect(notes.delete(4)).resolves.toBeUndefined();
  });

  it('should list notes', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: [{ id: 5 }] });
    const res = await notes.list();
    expect(res.data[0].id).toBe(5);
  });
}); 