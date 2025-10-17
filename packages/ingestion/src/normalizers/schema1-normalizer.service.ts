import { Injectable } from '@nestjs/common';
import { UnifiedDataModel } from '@buenro/common';
import { IDataNormalizer } from './interface';

/**
 * Normalizer for Schema 1 format:
 * {
 *   id: string,
 *   name: string,
 *   address: { country: string, city: string },
 *   isAvailable: boolean,
 *   priceForNight: number
 * }
 */
@Injectable()
export class Schema1Normalizer implements IDataNormalizer {
  normalize(item: any, source: string): UnifiedDataModel {
    return {
      id: String(item.id),
      source,
      ingestedAt: new Date(),
      name: item.name,
      isAvailable: Boolean(item.isAvailable),
      price: Number(item.priceForNight),
      raw: item,
    };
  }
}
