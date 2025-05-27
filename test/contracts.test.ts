import { Contracts } from '../src/entities/contracts';
import { AxiosInstance } from 'axios';
import winston from 'winston';
import { createMockAxios, createMockLogger, createTestRequestHandler } from './utils/testHelpers';

describe('Contracts', () => {
  let contracts: Contracts;
  let mockAxios: jest.Mocked<AxiosInstance>;
  let mockLogger: jest.Mocked<winston.Logger>;

  beforeEach(() => {
    mockAxios = createMockAxios();
    mockLogger = createMockLogger();
    const testRequestHandler = createTestRequestHandler(mockAxios, mockLogger);
    contracts = new Contracts(mockAxios, mockLogger, testRequestHandler);
  });

  it('should create a contract', async () => {
    mockAxios.post.mockResolvedValue({ data: { id: 1 } });
    const res = await contracts.create({ accountId: 123, contractType: 1 }); // Use number for contractType
    expect(res.data.id).toBe(1);
  });

  it('should get a contract', async () => {
    mockAxios.get.mockResolvedValue({ data: { id: 2 } });
    const res = await contracts.get(2);
    expect(res.data.id).toBe(2);
  });

  it('should update a contract', async () => {
    mockAxios.put.mockResolvedValue({ data: { id: 3, status: 1 } }); // Use number for status
    const res = await contracts.update(3, { status: 1 });
    expect(res.data.status).toBe(1);
  });

  it('should delete a contract', async () => {
    mockAxios.delete.mockResolvedValue({});
    await expect(contracts.delete(4)).resolves.toBeUndefined();
  });

  it('should list contracts', async () => {
    mockAxios.post.mockResolvedValue({ data: [{ id: 5 }] }); // Contracts use POST for list/query
    const res = await contracts.list();
    expect(res.data[0].id).toBe(5);
  });
}); 