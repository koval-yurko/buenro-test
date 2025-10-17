import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { pipeline } from 'stream/promises';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { DataRepository } from '@buenro/common';
import { IDataLoader } from '../loaders/interface';
import { UrlDataLoader } from '../loaders/url-data-loader.service';
import { FileDataLoader } from '../loaders/file-data-loader.service';
import { CountingTransformer } from '../transformers/counting.transformer';
import { NormalizingTransformer } from '../transformers/normalizing.transformer';
import { DeduplicationTransformer } from '../transformers/deduplication.transformer';
import { BatchInsertTransformer } from '../transformers/batch-insert.transformer';

export type IngestionSource = string;

@Injectable()
export class IngestionOrchestratorService {
  private readonly logger = new Logger(IngestionOrchestratorService.name);
  private readonly checkBatchSize: number;
  private readonly insertBatchSize: number;

  constructor(
    private readonly dataRepository: DataRepository,
    private readonly configService: ConfigService,
  ) {
    this.checkBatchSize = parseInt(this.configService.get<string>('CHECK_BATCH_SIZE', '50'));
    this.insertBatchSize = parseInt(this.configService.get<string>('INSERT_BATCH_SIZE', '50'));
  }

  public async ingestSource(source: IngestionSource): Promise<void> {
    this.logger.log(`Ingesting source: ${source}`);

    let totalProcessed = 0;
    let totalInserted = 0;
    let totalSkipped = 0;

    // Find appropriate loader
    const loader = this.createDataLoader(source);
    if (!loader) {
      throw new Error(`No loader found for source: ${source}`);
    }

    // Create transformers
    const countingTransformer = new CountingTransformer((count) => {
      totalProcessed = count;
    });

    const normalizingTransformer = new NormalizingTransformer(source);

    const deduplicationTransformer = new DeduplicationTransformer(
      source,
      this.dataRepository,
      this.checkBatchSize,
      (count) => {
        totalSkipped = count;
      },
    );

    const batchInsertTransformer = new BatchInsertTransformer(
      this.dataRepository,
      this.insertBatchSize,
      (count) => {
        totalInserted = count;
      },
    );

    // Load stream
    const stream = await loader.load(source);

    // Process pipeline
    try {
      await pipeline(
        stream,
        parser(),
        streamArray(),
        countingTransformer,
        normalizingTransformer,
        deduplicationTransformer,
        batchInsertTransformer,
      );

      this.logger.log(
        `Ingestion stats - Processed: ${totalProcessed}, Inserted: ${totalInserted}, Skipped: ${totalSkipped}`,
      );
    } catch (error) {
      this.logger.error(`Pipeline error: ${error.message}`, error.stack);
      throw error;
    }

    this.logger.log(`Completed ingestion for source: ${source}`);
  }

  private createDataLoader(source: IngestionSource): IDataLoader {
    if (source.includes('test')) {
      return new FileDataLoader();
    }
    return new UrlDataLoader();
  }
}
