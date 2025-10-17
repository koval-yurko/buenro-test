import { Module, DynamicModule, Global } from '@nestjs/common';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { Data, DataSchema } from './schemas/data.schema';
import { DataRepository } from './repositories/data.repository';

/**
 * Database module that can be shared across applications
 * Provides MongoDB connection and Data repository
 */
@Global()
@Module({})
export class DatabaseModule {
  /**
   * Register the database module with async MongoDB connection
   * Useful when URI comes from ConfigService
   */
  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) => Promise<MongooseModuleFactoryOptions> | MongooseModuleFactoryOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        MongooseModule.forRootAsync({
          useFactory: options.useFactory,
          inject: options.inject,
        }),
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
      imports: [MongooseModule.forFeature([{ name: Data.name, schema: DataSchema }])],
      providers: [DataRepository],
      exports: [DataRepository],
    };
  }
}
