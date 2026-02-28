import fs from 'fs/promises';
import path from 'path';

export class LocalAdapter {
  basePath: string;
  constructor(opts: { basePath: string }) {
    this.basePath = opts.basePath;
  }

  async upload(key: string, buf: Buffer) {
    const filePath = path.join(this.basePath, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buf);
    return filePath;
  }
}

export default LocalAdapter;
