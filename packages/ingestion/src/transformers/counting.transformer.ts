import { Transform } from 'stream';

/**
 * Transformer that counts items passing through the stream
 */
export class CountingTransformer extends Transform {
  private count = 0;

  constructor(private onCount: (count: number) => void) {
    super({ objectMode: true });
  }

  _transform(chunk: { key: number; value: any }, encoding: string, callback: Function) {
    this.count++;
    this.push(chunk.value);
    callback();
  }

  _flush(callback: Function) {
    this.onCount(this.count);
    callback();
  }
}
