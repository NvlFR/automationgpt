import fs from 'fs';
import path from 'path';
import { request } from 'undici';

export async function downloadFile(url: string, dest: string) {
  const { body } = await request(url);
  const fileStream = fs.createWriteStream(dest);
  for await (const chunk of body) {
    fileStream.write(chunk);
  }
  fileStream.end();
}

export function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}
