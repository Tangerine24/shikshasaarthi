export interface StorageAdapter {
  save(file: Express.Multer.File, studentId: string): Promise<{ storagePath: string; url: string }>;
  getUrl(storagePath: string): string;
  delete(storagePath: string): Promise<void>;
}
