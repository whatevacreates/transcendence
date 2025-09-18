import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

class JsonLoader {
  static load(relativePath, filename) {
    try {
      const fullPath = path.join(process.cwd(), relativePath, filename);
      const data = fs.readFileSync(fullPath, { encoding: 'utf8', flag: 'r' });
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to load JSON file: ${filename}`, error);
      throw new Error(`Could not load config from ${filename}`);
    }
  }
}


export default JsonLoader;