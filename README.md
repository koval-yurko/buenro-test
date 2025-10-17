# Buenro Test - Data Ingestion & API

A NestJS monorepo for ingesting and querying data from multiple external sources.

## Architecture

This is a monorepo with three packages:

- **`@buenro/common`** - Shared library containing:
  - `DatabaseModule` - NestJS MongoDB module with Data schema and repository
  - Type definitions - `UnifiedDataModel`, `DataAdapter`, etc.
  - Query utilities - Parse and transform query parameters
  - Constants - Query operators, pagination defaults
- **`@buenro/ingestion`** - Data ingestion service
- **`@buenro/api`** - REST API service with advanced filtering capabilities

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- npm

### Development

Install dependencies:
```bash
npm install
```

Copy environment variables:
```bash
cp ./packages/ingestion/.env.example ./packages/ingestion/.env
cp ./packages/api/.env.example ./packages/api/.env
```

Start infrastructure with Docker:
```bash
docker-compose up -d
```

Start infrastructure with Docker:
```bash
npm run build
```

Run ingestion with structured data source:
```bash
export INGESTION_SOURCE=https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/structured_generated_data.json
npm run start:ingestion
```

Run ingestion with large data source
```bash
export INGESTION_SOURCE=https://buenro-tech-assessment-materials.s3.eu-north-1.amazonaws.com/large_generated_data.json
npm run start:ingestion
```

Start API service:
```bash
npm run start:api
```

## API Usage

### Query Examples

Get all data:
```bash
curl http://localhost:3000/api/data
```

Filter by id (exact match):
```bash
curl "http://localhost:3000/api/data?id=891503"
```

Filter by array id (exact match):
```bash
curl "http://localhost:3000/api/data?id[in]=891503,954559"
```

Price range filtering:
```bash
curl "http://localhost:3000/api/data?price[gte]=100&price[lte]=500"
```

Multiple filters with sorting:
```bash
curl "http://localhost:3000/api/data?props.address.country[regex]=USA&isAvailable=true&sort=-price"
```

Pagination:
```bash
curl "http://localhost:3000/api/data?limit=20&offset=40"
```

### Supported Operators

- `eq` - Equal (default): `?field=value`
- `ne` - Not equal: `?field[ne]=value`
- `gt` - Greater than: `?field[gt]=100`
- `gte` - Greater than or equal: `?field[gte]=100`
- `lt` - Less than: `?field[lt]=1000`
- `lte` - Less than or equal: `?field[lte]=1000`
- `in` - In array: `?field[in]=val1,val2,val3`
- `nin` - Not in array: `?field[nin]=val1,val2`
- `regex` - Regex match: `?field[regex]=pattern`
- `exists` - Field exists: `?field[exists]=true`

## Adding New Data Sources

1. Create a new normalizer in `packages/ingestion/normalizers/`:

```typescript
export class Schema1Normalizer implements IDataNormalizer {
  normalize(item: any, source: string): UnifiedDataModel {
    // Transform to unified model
    return {
      source,
      ingestedAt: new Date(),
      id: '',           // required field
      isAvailable: '',  // required field
      price: 0,         // required field
      props: {
        // ... map other fields
      }
    };
  }
}
```

2. Update `createNormalizer` method of `packages/ingestion/transformers/normalizing.transformer.ts` with new normalizer.:
```typescript
  private createNormalizer(source: string): IDataNormalizer | undefined {
    if (source.includes('test') || source.includes('/structured_generated')) {
      return new Schema1Normalizer();
    }
    if (source.includes('/large_generated')) {
      return new Schema2Normalizer();
    }
    // Add new conditions here
  }
```

## Scripts

- `npm run build` - Build all packages
- `npm run start:api` - Start API service
- `npm run start:ingestion` - Start ingestion service
- `npm run test` - Run tests for all packages
- `npm run lint` - Lint all packages
- `npm run format` - Format code in all packages
