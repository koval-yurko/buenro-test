import { Transform, TransformCallback } from 'stream';
import { Logger } from '@nestjs/common';
import { IDataNormalizer } from '../normalizers/interface';
import { Schema1Normalizer } from '../normalizers/schema1-normalizer.service';
import { Schema2Normalizer } from '../normalizers/schema2-normalizer.service';

/**
 * Transformer that normalizes items using appropriate normalizer
 */
export class NormalizingTransformer extends Transform {
  private readonly logger = new Logger(NormalizingTransformer.name);

  constructor(private readonly sourceUrl: string) {
    super({ objectMode: true });
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback) {
    const normalizer = this.createNormalizer(this.sourceUrl);

    if (!normalizer) {
      this.logger.warn(`No normalizer found for item: ${JSON.stringify(chunk).substring(0, 100)}`);
      callback();
      return;
    }

    const normalized = normalizer.normalize(chunk, this.sourceUrl);
    this.push(normalized);
    callback();
  }

  private createNormalizer(source: string): IDataNormalizer | undefined {
    if (source.includes('test') || source.includes('/structured_generated')) {
      return new Schema1Normalizer();
    }
    if (source.includes('/large_generated')) {
      return new Schema2Normalizer();
    }
  }
}
