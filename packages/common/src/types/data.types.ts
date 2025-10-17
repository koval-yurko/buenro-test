/**
 * Unified data model that consolidates all external data sources
 */
export interface UnifiedDataModel {
  /** Unique identifier from source system */
  id: string;

  /** file path or URL of the original data source */
  source: string;

  /** Timestamp when data was ingested */
  ingestedAt: Date;

  /** Human-readable name/title */
  name?: string;

  /** Availability status */
  isAvailable?: boolean;

  /** Price value (standardized field from priceForNight/pricePerNight) */
  price?: number;

  /** Raw original data for reference */
  props?: Record<string, any>;
}
