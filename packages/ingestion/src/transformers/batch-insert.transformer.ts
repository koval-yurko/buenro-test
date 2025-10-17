import { Transform, TransformCallback } from 'stream';
import { UnifiedDataModel, DataRepository } from '@buenro/common';

/**
 * Transformer that batches items and inserts them into the database
 */
export class BatchInsertTransformer extends Transform {
  private batch: UnifiedDataModel[] = [];
  private insertedCount = 0;

  constructor(
    private readonly dataRepository: DataRepository,
    private readonly batchSize: number,
    private readonly onInserted: (count: number) => void,
  ) {
    super({ objectMode: true });
  }

  async _transform(chunk: UnifiedDataModel, encoding: string, callback: TransformCallback) {
    this.batch.push(chunk);

    if (this.batch.length >= this.batchSize) {
      try {
        await this.insertBatch();
        callback();
      } catch (error) {
        callback(error as Error);
      }
    } else {
      callback();
    }
  }

  async _flush(callback: TransformCallback) {
    try {
      if (this.batch.length > 0) {
        await this.insertBatch();
      }
      this.onInserted(this.insertedCount);
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }

  private async insertBatch() {
    if (this.batch.length === 0) return;

    await this.dataRepository.bulkInsert(this.batch);
    this.insertedCount += this.batch.length;
    this.batch = [];
  }
}
