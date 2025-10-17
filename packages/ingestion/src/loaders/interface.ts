import { Readable } from 'stream';

export interface IDataLoader {
  /**
   * Load data from a source and return a readable stream
   * @param source - The source identifier (URL, S3 URI, file path)
   * @returns A readable stream of the data
   */
  load(source: string): Promise<Readable>;
}
