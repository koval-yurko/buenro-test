import { UnifiedDataModel } from '@buenro/common';

export interface IDataNormalizer {
  /**
   * Normalize a raw data item to the unified schema
   * @param item - The raw data item
   * @param source - The source file/URL
   * @returns Normalized data
   */
  normalize(item: unknown, source: string): UnifiedDataModel;
}
