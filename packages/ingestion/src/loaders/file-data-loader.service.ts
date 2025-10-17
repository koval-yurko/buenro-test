import { Injectable } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { Readable } from 'stream';
import { IDataLoader } from './interface';
import * as process from 'node:process';

@Injectable()
export class FileDataLoader implements IDataLoader {
  async load(source: string): Promise<Readable> {
    if (!existsSync(source)) {
      throw new Error(`File not found: ${source}, cwd - ${process.cwd()}`);
    }

    return createReadStream(source);
  }
}
