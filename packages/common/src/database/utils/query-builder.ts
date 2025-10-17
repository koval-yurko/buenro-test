/**
 * Supported MongoDB operators
 */
const OPERATORS = {
  eq: '$eq',
  ne: '$ne',
  gt: '$gt',
  gte: '$gte',
  lt: '$lt',
  lte: '$lte',
  in: '$in',
  nin: '$nin',
  regex: '$regex',
  exists: '$exists',
};

/**
 * Build MongoDB filter from query parameters
 *
 * Relies on NestJS query parsing:
 * - ?name=Hotel → { name: 'Hotel' }
 * - ?price[gte]=100&price[lte]=500 → { price: { gte: '100', lte: '500' } }
 *
 * @example
 * Input: { name: 'Hotel', price: { gte: '100', lte: '500' } }
 * Output: { name: 'Hotel', price: { $gte: 100, $lte: 500 } }
 */
export function buildMongoFilter(queryParams: Record<string, any>): Record<string, any> {
  const filter: Record<string, any> = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (value === undefined || value === null) continue;

    // Check if value is an object with operators (NestJS parsed format)
    if (typeof value === 'object' && !Array.isArray(value)) {
      const operators = Object.keys(value);
      const hasOperators = operators.some((op) => op in OPERATORS);

      if (hasOperators) {
        // Handle operator object: { field: { eq: 'value', gt: 10 } }
        const filterValue: Record<string, any> = {};

        for (const [operator, operatorValue] of Object.entries(value)) {
          const mongoOperator = OPERATORS[operator as keyof typeof OPERATORS];

          if (!mongoOperator) continue;

          // Handle special cases
          if (operator === 'eq') {
            // For equality, set value directly (avoids MongoDB casting issues)
            filter[key] = operatorValue;
            break;
          } else if (operator === 'in' || operator === 'nin') {
            // Split comma-separated values
            const values = typeof operatorValue === 'string' ? operatorValue.split(',') : [operatorValue];
            filterValue[mongoOperator] = values;
          } else if (operator === 'regex') {
            filterValue[mongoOperator] = operatorValue;
            filterValue.$options = 'i'; // Case-insensitive
          } else if (operator === 'exists') {
            filterValue[mongoOperator] = operatorValue === 'true' || operatorValue === true;
          } else {
            // Numeric operators (gt, gte, lt, lte, ne)
            const numValue = Number(operatorValue);
            filterValue[mongoOperator] = isNaN(numValue) ? operatorValue : numValue;
          }
        }

        // Only set filter if we have valid operators
        if (Object.keys(filterValue).length > 0) {
          filter[key] = filterValue;
        }
      }
      // Note: Nested objects without operators are ignored
      // Use dot notation instead: ?props.address.city=London
    } else {
      // Simple equality
      filter[key] = value;
    }
  }

  return filter;
}

/**
 * Parse sort parameter
 *
 * @example
 * Input: '-price,name'
 * Output: { price: -1, name: 1 }
 */
export function buildMongoSort(sortParam?: string): Record<string, 1 | -1> | undefined {
  if (!sortParam) return undefined;

  const sort: Record<string, 1 | -1> = {};
  const fields = sortParam.split(',');

  for (const field of fields) {
    if (field.startsWith('-')) {
      sort[field.substring(1)] = -1; // Descending
    } else {
      sort[field] = 1; // Ascending
    }
  }

  return sort;
}