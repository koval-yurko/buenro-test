import { Injectable } from '@nestjs/common';
import { UnifiedDataModel } from '@buenro/common';
import { IDataNormalizer } from './interface';

/**
 * Normalizer for Schema 2 format:
 * {
 *   id: string,
 *   city: string,
 *   availability: boolean,
 *   priceSegment: string,
 *   pricePerNight: number
 * }
 */
@Injectable()
export class Schema2Normalizer implements IDataNormalizer {
  normalize(item: any, source: string): UnifiedDataModel {
    const { id, availability, pricePerNight, ...props } = item;
    return {
      id: String(id),
      source,
      ingestedAt: new Date(),
      isAvailable: Boolean(availability),
      price: Number(pricePerNight),
      props,
    };
  }
}
