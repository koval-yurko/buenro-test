# Database Module

Shared MongoDB module for the Buenro monorepo. This module centralizes all database operations and can be used by both the API and Ingestion services.

## Architecture

The database module follows the Repository pattern to abstract MongoDB operations:

```
database/
├── schemas/          # Mongoose schemas
│   └── data.schema.ts
├── repositories/     # Repository services
│   └── data.repository.ts
├── database.module.ts # Module definition
└── README.md
```

## Usage

### In Application Module

Import the `DatabaseModule` in your application's root module:

```typescript
import { DatabaseModule } from '@buenro/common';

@Module({
  imports: [
    DatabaseModule.forRoot('mongodb://localhost:27017/mydb'),
    // ... other modules
  ],
})
export class AppModule {}
```

### With ConfigService (Async)

For dynamic configuration with environment variables:

```typescript
import { DatabaseModule } from '@buenro/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        configService.get<string>('MONGO_URI'),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### In Feature Modules

If MongoDB is already connected, use `forFeature()`:

```typescript
import { DatabaseModule } from '@buenro/common';

@Module({
  imports: [DatabaseModule.forFeature()],
  // ...
})
export class MyFeatureModule {}
```

## Using the DataRepository

Inject `DataRepository` into your services:

```typescript
import { Injectable } from '@nestjs/common';
import { DataRepository } from '@buenro/common';

@Injectable()
export class MyService {
  constructor(private readonly dataRepository: DataRepository) {}

  async getData() {
    return this.dataRepository.findAll({}, { limit: 10 });
  }
}
```

## DataRepository API

### Query Methods

**`findAll(filterParams, options?)`**
- Find documents with filtering, sorting, and pagination
- Returns: `Promise<Data[]>`

```typescript
await dataRepository.findAll(
  { price: { $gte: 100 } },
  { limit: 50, offset: 0, sort: '-price' }
);
```

**`count(filterParams)`**
- Count documents matching filter
- Returns: `Promise<number>`

**`findById(id)`**
- Find single document by ID
- Returns: `Promise<Data | null>`

**`findOne(filter)`**
- Find single document by filter
- Returns: `Promise<Data | null>`

### Write Methods

**`bulkInsert(data)`**
- Insert multiple documents
- Returns: `Promise<any>`

```typescript
await dataRepository.bulkInsert([
  { id: '1', source: 'test', ... },
  { id: '2', source: 'test', ... },
]);
```

**`updateMany(filter, update)`**
- Update multiple documents
- Returns: `Promise<number>` (modified count)

**`deleteMany(filter)`**
- Delete multiple documents
- Returns: `Promise<number>` (deleted count)

### Utility Methods

**`getDistinct(field)`**
- Get distinct values for a field
- Returns: `Promise<any[]>`

**`getStats()`**
- Get collection statistics
- Returns: `Promise<any>`

## Schema

The `Data` schema includes:

```typescript
{
  id: string;           // Unique identifier
  source: string;       // Data source name (indexed)
  sourceFile: string;   // Original file path
  ingestedAt: Date;     // Ingestion timestamp (indexed)
  name?: string;        // Name/title (indexed)
  isAvailable?: boolean; // Availability flag (indexed)
  price?: number;       // Price value (indexed)
  priceSegment?: string; // Price classification (indexed)
  city?: string;        // City name (indexed)
  address?: {
    country?: string;   // Country (indexed)
    city?: string;      // City from nested address (indexed)
  };
  raw?: object;         // Raw original data
}
```

## Indexes

The schema includes the following indexes for optimal query performance:

- Single field indexes: `source`, `ingestedAt`, `name`, `isAvailable`, `price`, `priceSegment`, `city`
- Nested field indexes: `address.country`, `address.city`
- Compound index: `{ source: 1, ingestedAt: -1 }`

## Benefits

✅ **Centralized Logic** - All database operations in one place
✅ **Type Safety** - Full TypeScript support across services
✅ **DRY Principle** - No duplicate code between API and Ingestion
✅ **Easy Testing** - Mock `DataRepository` in tests
✅ **Consistent API** - Same interface for all database operations
✅ **Global Module** - Automatically available after import

## Examples

### API Service Usage

```typescript
// packages/api/src/data/data.controller.ts
@Controller('api/data')
export class DataController {
  constructor(private readonly dataRepository: DataRepository) {}

  @Get()
  async findAll(@Query() query: any) {
    const data = await this.dataRepository.findAll(query);
    return { data };
  }
}
```

### Ingestion Service Usage

```typescript
// packages/ingestion/src/processors/ingestion.processor.ts
@Processor('data-ingestion')
export class IngestionProcessor {
  constructor(private readonly dataRepository: DataRepository) {}

  @Process('ingest')
  async handleIngestion(job: Job) {
    const transformedData = this.transform(job.data);
    await this.dataRepository.bulkInsert(transformedData);
  }
}
```
