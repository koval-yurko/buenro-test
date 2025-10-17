import { Controller, Get, Query } from '@nestjs/common';
import { DataRepository } from '@buenro/common';

const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
};

@Controller('api/data')
export class DataController {
  constructor(private readonly dataRepository: DataRepository) {}

  /**
   * Get all data with filtering support
   *
   * Example queries:
   * - GET /api/data?name=Hotel
   * - GET /api/data?price[gte]=100&price[lte]=500
   * - GET /api/data?city[regex]=London&isAvailable=true
   * - GET /api/data?source=property-service&sort=-price
   * - GET /api/data?priceSegment[in]=high,medium&limit=20
   */
  @Get()
  async findAll(@Query() query: any) {
    const { limit: limitStr, offset: offsetStr, sort, ...filterParams } = query;
    const limit = Math.min(parseInt(limitStr) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const offset = parseInt(offsetStr) || PAGINATION.DEFAULT_OFFSET;

    const [data, total] = await Promise.all([
      this.dataRepository.findAll(filterParams, { limit, offset, sort }),
      this.dataRepository.count(filterParams),
    ]);

    return {
      data,
      meta: {
        total,
        limit,
        offset,
        count: data.length,
      },
    };
  }
}
