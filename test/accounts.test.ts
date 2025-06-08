import { Accounts } from '../src/entities/accounts';
import { AxiosInstance } from 'axios';
import winston from 'winston';

describe('Accounts', () => {
  let accounts: Accounts;
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
    accounts = new Accounts(mockAxios as AxiosInstance, logger);
  });

  it('should create an account', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({
      data: { id: 1 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });
    const res = await accounts.create({ name: 'Test Account' });
    expect(res.data.id).toBe(1);
  });

  it('should get an account', async () => {
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: { id: 2 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });
    const res = await accounts.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update an account', async () => {
    (mockAxios.put as jest.Mock).mockResolvedValue({
      data: { id: 3, name: 'Updated' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });
    const res = await accounts.update(3, { name: 'Updated' });
    expect(res.data.name).toBe('Updated');
  });

  it('should delete an account', async () => {
    (mockAxios.delete as jest.Mock).mockResolvedValue({
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });
    await expect(accounts.delete(4)).resolves.toBeUndefined();
  });

  it('should list accounts', async () => {
    (mockAxios.post as jest.Mock).mockResolvedValue({
      data: { items: [{ id: 5 }] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    });
    const res = await accounts.list();
    expect(res.data[0].id).toBe(5);
  });
});
