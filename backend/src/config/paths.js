import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const BACKEND_ROOT = path.resolve(__dirname, '..', '..');

export const UPLOADS_DIR = path.join(BACKEND_ROOT, 'uploads');
export const PRODUCTS_UPLOAD_DIR = path.join(UPLOADS_DIR, 'products');
export const SITE_UPLOAD_DIR = path.join(UPLOADS_DIR, 'site');

export const UPLOADS_URL_PREFIX = '/uploads';

// Base host for building absolute image URLs in seeds/responses.
export const apiPublicUrl = () => process.env.API_PUBLIC_URL || 'http://localhost:5000';

// Ensure the upload directories exist (idempotent — safe to call on boot/seed).
export function ensureUploadDirs() {
  for (const dir of [UPLOADS_DIR, PRODUCTS_UPLOAD_DIR, SITE_UPLOAD_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
