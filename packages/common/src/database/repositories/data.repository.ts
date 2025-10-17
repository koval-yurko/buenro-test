import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Data } from '../schemas/data.schema';
import { UnifiedDataModel } from '../../types/data.types';

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
}
