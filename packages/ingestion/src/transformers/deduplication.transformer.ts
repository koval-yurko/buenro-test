import { Transform } from 'stream';
import { UnifiedDataModel, DataRepository } from '@buenro/common';

/**
 * Transformer that checks for duplicates in batches and filters them out
 */
export class DeduplicationTransformer extends Transform {
  private batch: UnifiedDataModel[] = [];
  private skippedCount = 0;

  constructor(
    private readonly sourceName: string,
    private readonly dataRepository: DataRepository,
    private readonly batchSize: number,
    private readonly onSkipped: (count: number) => void,
  ) {
    super({ objectMode: true });
  }

  async _transform(chunk: UnifiedDataModel, encoding: string, callback: Function) {
    this.batch.push(chunk);

    if (this.batch.length >= this.batchSize) {
      try {
        await this.processBatch();
        callback();
      } catch (error) {
        callback(error);
      }
    } else {
      callback();
    }
  }

  async _flush(callback: Function) {
    try {
      if (this.batch.length > 0) {
        await this.processBatch();
      }
      this.onSkipped(this.skippedCount);
      callback();
    } catch (error) {
      callback(error);
    }
  }

  private async processBatch() {
    if (this.batch.length === 0) return;

    const ids = this.batch.map((item) => item.id);
    const existing = await this.dataRepository.findByIdsAndSource(ids, this.sourceName);
    const existingIds = new Set(existing.map((item) => item.id));

    const newItems = this.batch.filter((item) => !existingIds.has(item.id));
    this.skippedCount += this.batch.length - newItems.length;

    // Push new items downstream
    for (const item of newItems) {
      this.push(item);
    }

    this.batch = [];
  }
}
