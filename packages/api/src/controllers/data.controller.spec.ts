import { Test, TestingModule } from '@nestjs/testing';
import { DataController } from './data.controller';
import { DataRepository } from '@buenro/common';

describe('DataController', () => {
  let controller: DataController;
  let repository: DataRepository;

  const mockDataRepository = {
    findAll: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataController],
      providers: [
        {
          provide: DataRepository,
          useValue: mockDataRepository,
        },
      ],
    }).compile();

    controller = module.get<DataController>(DataController);
    repository = module.get<DataRepository>(DataRepository);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return data with default pagination', async () => {
      const mockData = [
        {
          id: '123456',
          source: 'test-source',
          isAvailable: true,
          price: 150,
          ingestedAt: new Date(),
          props: { name: 'Hotel 1' },
        },
        {
          id: '789012',
          source: 'test-source',
          isAvailable: false,
          price: 200,
          ingestedAt: new Date(),
          props: { name: 'Hotel 2' },
        },
      ];

      mockDataRepository.findAll.mockResolvedValue(mockData);
      mockDataRepository.count.mockResolvedValue(50);

      const result = await controller.findAll({});

      expect(repository.findAll).toHaveBeenCalledWith(
        {},
        { limit: 10, offset: 0, sort: undefined },
      );
      expect(repository.count).toHaveBeenCalledWith({});
      expect(result).toEqual({
        data: mockData,
        meta: {
          total: 50,
          limit: 10,
          offset: 0,
          count: 2,
        },
      });
    });

    it('should apply custom limit and offset', async () => {
      const mockData = [
        {
          id: '111111',
          source: 'test',
          isAvailable: true,
          price: 100,
          ingestedAt: new Date(),
          props: {},
        },
      ];

      mockDataRepository.findAll.mockResolvedValue(mockData);
      mockDataRepository.count.mockResolvedValue(100);

      const query = { limit: '25', offset: '50' };
      const result = await controller.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(
        {},
        { limit: 25, offset: 50, sort: undefined },
      );
      expect(result.meta).toEqual({
        total: 100,
        limit: 25,
        offset: 50,
        count: 1,
      });
    });

    it('should enforce max limit of 100', async () => {
      mockDataRepository.findAll.mockResolvedValue([]);
      mockDataRepository.count.mockResolvedValue(0);

      const query = { limit: '500' };
      await controller.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(
        {},
        { limit: 100, offset: 0, sort: undefined },
      );
    });

    it('should exclude pagination params from filter', async () => {
      mockDataRepository.findAll.mockResolvedValue([]);
      mockDataRepository.count.mockResolvedValue(0);

      const query = {
        name: 'Hotel',
        limit: '20',
        offset: '10',
        sort: '-price',
      };
      await controller.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(
        { name: 'Hotel' },
        { limit: 20, offset: 10, sort: '-price' },
      );
      expect(repository.count).toHaveBeenCalledWith({ name: 'Hotel' });
    });

    it('should handle invalid limit as default', async () => {
      mockDataRepository.findAll.mockResolvedValue([]);
      mockDataRepository.count.mockResolvedValue(0);

      const query = { limit: 'invalid' };
      await controller.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(
        {},
        { limit: 10, offset: 0, sort: undefined },
      );
    });

    it('should handle invalid offset as default', async () => {
      mockDataRepository.findAll.mockResolvedValue([]);
      mockDataRepository.count.mockResolvedValue(0);

      const query = { offset: 'invalid' };
      await controller.findAll(query);

      expect(repository.findAll).toHaveBeenCalledWith(
        {},
        { limit: 10, offset: 0, sort: undefined },
      );
    });

    it('should propagate repository errors', async () => {
      const error = new Error('Database connection failed');
      mockDataRepository.findAll.mockRejectedValue(error);

      await expect(controller.findAll({})).rejects.toThrow('Database connection failed');
    });
  });
});
