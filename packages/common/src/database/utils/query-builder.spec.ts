import { buildMongoFilter, buildMongoSort } from './query-builder';

describe('Query Builder', () => {
  describe('buildMongoFilter', () => {
    it('should handle simple equality filters', () => {
      const params = { name: 'Hotel', city: 'Berlin' };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        name: 'Hotel',
        city: 'Berlin',
      });
    });

    it('should handle eq operator', () => {
      const params = { id: { eq: '123456' } };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        id: '123456',
      });
    });

    it('should handle numeric comparison operators', () => {
      const params = {
        price: { gte: '100', lte: '500' },
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        price: { $gte: 100, $lte: 500 },
      });
    });

    it('should handle gt and lt operators', () => {
      const params = {
        rating: { gt: '4.0', lt: '5.0' },
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        rating: { $gt: 4.0, $lt: 5.0 },
      });
    });

    it('should handle ne operator', () => {
      const params = {
        status: { ne: 'inactive' },
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        status: { $ne: 'inactive' },
      });
    });

    it('should handle in operator with comma-separated values', () => {
      const params = {
        status: { in: 'active,pending,completed' },
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        status: { $in: ['active', 'pending', 'completed'] },
      });
    });

    it('should handle nin operator', () => {
      const params = {
        category: { nin: 'deleted,archived' },
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        category: { $nin: ['deleted', 'archived'] },
      });
    });

    it('should handle regex operator', () => {
      const params = {
        name: { regex: 'hotel' },
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        name: { $regex: 'hotel', $options: 'i' },
      });
    });

    it('should handle exists operator with string', () => {
      const params = {
        description: { exists: 'false' },
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        description: { $exists: false },
      });
    });

    it('should handle exists operator with boolean', () => {
      const params = {
        metadata: { exists: false },
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        metadata: { $exists: false },
      });
    });

    it('should ignore undefined and null values', () => {
      const params = {
        name: 'Hotel',
        city: undefined,
        country: null,
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        name: 'Hotel',
      });
    });

    it('should ignore nested objects without operators', () => {
      const params = {
        name: 'Hotel',
        address: { country: 'Germany', city: 'Berlin' },
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        name: 'Hotel',
      });
    });

    it('should handle nested objects with dot syntax', () => {
      const params = {
        name: 'Hotel',
        'address.country': 'Germany',
        'address.city': { regex: 'Berlin' },
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        name: 'Hotel',
        'address.country': 'Germany',
        'address.city': { $regex: 'Berlin', $options: 'i' },
      });
    });

    it('should ignore invalid operators', () => {
      const params = {
        price: { neq: '100', invalid: 'test' },
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({});
    });

    it('should handle multiple operators on same field', () => {
      const params = {
        price: { gte: '100', lte: '500' },
        rating: { gt: '3.0' },
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        price: { $gte: 100, $lte: 500 },
        rating: { $gt: 3.0 },
      });
    });

    it('should handle mixed simple and operator filters', () => {
      const params = {
        name: 'Hotel',
        price: { gte: '100' },
        isAvailable: true,
      };
      const result = buildMongoFilter(params);

      expect(result).toEqual({
        name: 'Hotel',
        price: { $gte: 100 },
        isAvailable: true,
      });
    });
  });

  describe('buildMongoSort', () => {
    it('should return undefined for empty sort parameter', () => {
      const result = buildMongoSort();
      expect(result).toBeUndefined();
    });

    it('should handle single ascending field', () => {
      const result = buildMongoSort('name');
      expect(result).toEqual({ name: 1 });
    });

    it('should handle single descending field', () => {
      const result = buildMongoSort('-price');
      expect(result).toEqual({ price: -1 });
    });

    it('should handle multiple fields', () => {
      const result = buildMongoSort('-price,name,createdAt');
      expect(result).toEqual({
        price: -1,
        name: 1,
        createdAt: 1,
      });
    });

    it('should handle mixed ascending and descending', () => {
      const result = buildMongoSort('name,-price,-rating,createdAt');
      expect(result).toEqual({
        name: 1,
        price: -1,
        rating: -1,
        createdAt: 1,
      });
    });
  });
});
