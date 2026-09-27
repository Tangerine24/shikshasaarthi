import fs from 'fs';
import path from 'path';
import { StorageAdapter } from './storage.interface';
import { config } from '../../../config';

export const LocalAdapter: StorageAdapter = {
  async save(file: Express.Multer.File, studentId: string) {
    const dir = path.join(config.uploadDir, studentId);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    const filename = `${Date.now()}-${file.originalname}`;
    const storagePath = path.join(dir, filename);
    fs.writeFileSync(storagePath, file.buffer);
    
    return { storagePath, url: `/uploads/${studentId}/${filename}` };
  },
  getUrl(storagePath: string) {
    return storagePath.replace(config.uploadDir, '/uploads').replace(/\\/g, '/');
  },
  async delete(storagePath: string) {
    if (fs.existsSync(storagePath)) fs.unlinkSync(storagePath);
  }
};
