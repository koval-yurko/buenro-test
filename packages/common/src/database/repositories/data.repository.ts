import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Data } from '../schemas/data.schema';
import { UnifiedDataModel } from '../../types/data.types';
import { buildMongoFilter, buildMongoSort } from '../utils/query-builder';

export interface FindOptions {
  limit?: number;
  offset?: number;
  sort?: string;
}

/**
 * Repository for Data collection operations
 * Shared between API and Ingestion services
 */
@Injectable()
export class DataRepository {
  constructor(@InjectModel(Data.name) private dataModel: Model<Data>) {}

  /**
   * Bulk insert data
   */
  async bulkInsert(data: UnifiedDataModel[]): Promise<any> {
    return this.dataModel.insertMany(data, { ordered: false });
  }

  /**
   * Find documents by IDs and source
   * Used for duplicate checking during ingestion
   * @param ids - Array of IDs to search for
   * @param source - Source name to filter by
   * @returns Array of found documents
   */
  async findByIdsAndSource(ids: string[], source: string): Promise<{ id: string }[]> {
    return this.dataModel
      .find({
        id: { $in: ids },
        source: source,
      })
      .select('id source')
      .lean()
      .exec();
  }

  /**
   * Find all documents with filtering, pagination, and sorting
   * @param filterParams - Query parameters for filtering
   * @param options - Pagination and sorting options
   * @returns Array of documents
   */
  async findAll(
    filterParams: Record<string, any>,
    options: FindOptions = {},
  ): Promise<UnifiedDataModel[]> {
    const { limit = 10, offset = 0, sort } = options;

    const filter = buildMongoFilter(filterParams);
    const mongoSort = buildMongoSort(sort);

    let query = this.dataModel.find(filter).skip(offset).limit(limit);

    if (mongoSort) {
      query = query.sort(mongoSort);
    }

    return query.lean().exec();
  }

  /**
   * Count documents matching filter
   * @param filterParams - Query parameters for filtering
   * @returns Document count
   */
  async count(filterParams: Record<string, any>): Promise<number> {
    const filter = buildMongoFilter(filterParams);
    return this.dataModel.countDocuments(filter).exec();
  }
}
