import { Contacts } from '../src/entities/contacts';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('Contacts', () => {
  let contacts: Contacts;
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
    contacts = new Contacts(mockAxios as AxiosInstance, logger);
  });

  it('should create a contact', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({ data: { id: 1 } });
    const res = await contacts.create({ name: 'Test Contact' });
    expect(res.data.id).toBe(1);
  });

  it('should get a contact', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: { id: 2 } });
    const res = await contacts.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update a contact', async () => {
    (mockAxios.put as jest.Mock).mockResolvedValue({ data: { id: 3, name: 'Updated' } });
    const res = await contacts.update(3, { name: 'Updated' });
    expect(res.data.name).toBe('Updated');
  });

  it('should delete a contact', async () => {
    (mockAxios.delete as jest.Mock).mockResolvedValue({});
    await expect(contacts.delete(4)).resolves.toBeUndefined();
  });

  it('should list contacts', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({ data: [{ id: 5 }] });
    const res = await contacts.list();
    expect(res.data[0].id).toBe(5);
  });
}); 