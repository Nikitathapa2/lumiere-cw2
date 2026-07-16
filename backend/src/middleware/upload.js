import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { PRODUCTS_UPLOAD_DIR, ensureUploadDirs } from '../config/paths.js';

ensureUploadDirs();

const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
const ALLOWED_MIME = /^image\/(jpe?g|png|webp|avif|gif)$/i;

function safeName(original) {
  const ext = path.extname(original).toLowerCase();
  const base = path
    .basename(original, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'image';
  const rand = crypto.randomBytes(4).toString('hex');
  return `${base}-${rand}${ext}`;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PRODUCTS_UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, safeName(file.originalname)),
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED.has(ext) && ALLOWED_MIME.test(file.mimetype)) return cb(null, true);
  cb(new Error('Only image files (jpg, png, webp, avif, gif) are allowed.'));
}

const singleImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');

// Wrap so Multer/validation failures surface as clean 400s (the central error
// handler honors err.statusCode) instead of a 500 with a stack trace.
export function uploadProductImage(req, res, next) {
  singleImage(req, res, (err) => {
    if (err) {
      err.statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    }
    next(err);
  });
}
