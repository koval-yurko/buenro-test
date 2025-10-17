import { Schema1Normalizer } from './schema1-normalizer.service';
import { UnifiedDataModel } from '@buenro/common';

describe('Schema1Normalizer', () => {
  let normalizer: Schema1Normalizer;

  beforeEach(() => {
    normalizer = new Schema1Normalizer();
  });

  describe('normalize', () => {
    it('should normalize to unified data format', () => {
      const input = {
        id: 123456,
        name: 'Test Hotel',
        address: {
          country: 'Germany',
          city: 'Berlin',
        },
        isAvailable: true,
        priceForNight: 150,
      };

      const source = 'https://example.com/test.json';
      const result: UnifiedDataModel = normalizer.normalize(input, source);

      expect(result.id).toBe('123456');
      expect(result.source).toBe(source);
      expect(result.isAvailable).toBe(true);
      expect(result.price).toBe(150);
      expect(result.ingestedAt).toBeInstanceOf(Date);
      expect(result.props).toEqual({
        name: 'Test Hotel',
        address: {
          country: 'Germany',
          city: 'Berlin',
        },
      });
    });

    it('should handle minimal input', () => {
      const input = {
        id: 555555,
        isAvailable: false,
        priceForNight: 100,
      };

      const result = normalizer.normalize(input, 'test-source');

      expect(result.id).toBe('555555');
      expect(result.isAvailable).toBe(false);
      expect(result.price).toBe(100);
      expect(result.props).toEqual({});
    });

    it('should include all other properties in props', () => {
      const input = {
        id: 333333,
        name: 'Luxury Hotel',
        address: { country: 'Italy', city: 'Rome' },
        isAvailable: true,
        priceForNight: 500,
        rating: 4.5,
        amenities: ['wifi', 'pool', 'spa'],
        description: 'A beautiful hotel',
      };

      const result = normalizer.normalize(input, 'test-source');

      expect(result.props).toEqual({
        name: 'Luxury Hotel',
        address: { country: 'Italy', city: 'Rome' },
        rating: 4.5,
        amenities: ['wifi', 'pool', 'spa'],
        description: 'A beautiful hotel',
      });
    });

    it('should set ingestedAt to current date', () => {
      const input = {
        id: 444444,
        name: 'Hotel',
        address: { country: 'UK', city: 'London' },
        isAvailable: true,
        priceForNight: 250,
      };

      const beforeTime = new Date();
      const result = normalizer.normalize(input, 'test-source');
      const afterTime = new Date();

      expect(result.ingestedAt).toBeInstanceOf(Date);
      expect(result.ingestedAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(result.ingestedAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });
});
