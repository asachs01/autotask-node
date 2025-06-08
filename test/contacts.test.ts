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
    logger = winston.createLogger({ transports: [] });
    contacts = new Contacts(mockAxios as AxiosInstance, logger);
  });

  it('should create a contact', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({
      data: { id: 1 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });
    const res = await contacts.create({ firstName: 'John', lastName: 'Doe' });
    expect(res.data.id).toBe(1);
  });

  it('should get a contact', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: { id: 2 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });
    const res = await contacts.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update a contact', async () => {
    (mockAxios.put as jest.Mock).mockResolvedValue({
      data: { id: 3, firstName: 'Jane' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });
    const res = await contacts.update(3, { firstName: 'Jane' });
    expect(res.data.firstName).toBe('Jane');
  });

  it('should delete a contact', async () => {
    (mockAxios.delete as jest.Mock).mockResolvedValue({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });
    await expect(contacts.delete(4)).resolves.toBeUndefined();
  });

  it('should list contacts', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({
      data: { items: [{ id: 5 }] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });
    const res = await contacts.list();
    expect(res.data[0].id).toBe(5);
  });
});
