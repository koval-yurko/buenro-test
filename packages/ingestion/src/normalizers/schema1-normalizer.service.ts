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
    const { id, isAvailable, priceForNight, ...props } = item;
    return {
      id: String(id),
      source,
      ingestedAt: new Date(),
      isAvailable: Boolean(isAvailable),
      price: Number(priceForNight),
      props,
    };
  }
}
