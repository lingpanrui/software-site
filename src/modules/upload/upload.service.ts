import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';

export interface UploadResult {
  url: string;
  size: number;
  name: string;
}

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export const multerConfig = {
  storage: diskStorage({
    destination: (req: unknown, file: MulterFile, cb: (error: Error | null, destination: string) => void) => {
      const dir = path.resolve(UPLOAD_DIR);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req: unknown, file: MulterFile, cb: (error: Error | null, filename: string) => void) => {
      const ext = path.extname(file.originalname) || '';
      const filename = `${uuidv4()}${ext}`;
      cb(null, filename);
    },
  }),
};

@Injectable()
export class UploadService {
  processFile(file: MulterFile): UploadResult {
    return {
      url: `/uploads/${file.filename}`,
      size: file.size,
      name: file.originalname,
    };
  }
}
