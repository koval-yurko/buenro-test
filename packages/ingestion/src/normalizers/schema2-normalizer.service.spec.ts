import { Schema2Normalizer } from './schema2-normalizer.service';
import { UnifiedDataModel } from '@buenro/common';

describe('Schema2Normalizer', () => {
  let normalizer: Schema2Normalizer;

  beforeEach(() => {
    normalizer = new Schema2Normalizer();
  });

  describe('normalize', () => {
    it('should normalize to unified data format', () => {
      const input = {
        id: 'abc12345',
        city: 'Berlin',
        availability: true,
        priceSegment: 'high',
        pricePerNight: 250,
      };

      const source = 'https://example.com/test.json';
      const result: UnifiedDataModel = normalizer.normalize(input, source);

      expect(result.id).toBe('abc12345');
      expect(result.source).toBe(source);
      expect(result.isAvailable).toBe(true);
      expect(result.price).toBe(250);
      expect(result.ingestedAt).toBeInstanceOf(Date);
      expect(result.props).toEqual({
        city: 'Berlin',
        priceSegment: 'high',
      });
    });

    it('should handle minimal input', () => {
      const input = {
        id: 'xyz99999',
        availability: false,
        pricePerNight: 100,
      };

      const result = normalizer.normalize(input, 'test-source');

      expect(result.id).toBe('xyz99999');
      expect(result.isAvailable).toBe(false);
      expect(result.price).toBe(100);
      expect(result.props).toEqual({});
    });

    it('should include all other properties in props', () => {
      const input = {
        id: 'lux54321',
        city: 'Paris',
        availability: true,
        priceSegment: 'medium',
        pricePerNight: 350,
        rating: 4.8,
        amenities: ['wifi', 'breakfast', 'parking'],
        description: 'Luxury accommodation',
      };

      const result = normalizer.normalize(input, 'test-source');

      expect(result.props).toEqual({
        city: 'Paris',
        priceSegment: 'medium',
        rating: 4.8,
        amenities: ['wifi', 'breakfast', 'parking'],
        description: 'Luxury accommodation',
      });
    });

    it('should set ingestedAt to current date', () => {
      const input = {
        id: 'test003',
        city: 'Amsterdam',
        availability: true,
        pricePerNight: 300,
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
