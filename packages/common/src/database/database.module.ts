import { Module, DynamicModule, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Data, DataSchema } from '@/database/schemas/data.schema';
import { DataRepository } from '@/database/repositories/data.repository';

/**
 * Database module that can be shared across applications
 * Provides MongoDB connection and Data repository
 */
@Global()
@Module({})
export class DatabaseModule {
  /**
   * Register the database module with MongoDB connection
   * @param uri MongoDB connection URI
   */
  static forRoot(uri: string): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: Data.name, schema: DataSchema }]),
      ],
      providers: [DataRepository],
      exports: [DataRepository, MongooseModule],
    };
  }

  /**
   * Register just the feature module (when MongoDB is already connected)
   * Use this in child modules that need access to Data repository
   */
  static forFeature(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        MongooseModule.forFeature([{ name: Data.name, schema: DataSchema }]),
      ],
      providers: [DataRepository],
      exports: [DataRepository],
    };
  }
}
