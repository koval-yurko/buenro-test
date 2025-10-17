import { Injectable } from '@nestjs/common';
import { get } from 'https';
import { get as httpGet } from 'http';
import { Readable } from 'stream';
import { IDataLoader } from './interface';

@Injectable()
export class UrlDataLoader implements IDataLoader {
  async load(source: string): Promise<Readable> {
    return new Promise((resolve, reject) => {
      const getMethod = source.startsWith('https://') ? get : httpGet;

      getMethod(source, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Handle redirects
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            this.load(redirectUrl).then(resolve).catch(reject);
            return;
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch ${source}: HTTP ${response.statusCode}`));
          return;
        }

        resolve(response);
      }).on('error', reject);
    });
  }
}
