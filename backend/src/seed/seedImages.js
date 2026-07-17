import fs from 'fs';
import path from 'path';
import {
  BACKEND_ROOT,
  PRODUCTS_UPLOAD_DIR,
  SITE_UPLOAD_DIR,
  UPLOADS_URL_PREFIX,
  apiPublicUrl,
  ensureUploadDirs,
} from '../config/paths.js';

const WORKSPACE_ROOT = path.resolve(BACKEND_ROOT, '..');
const CLOTHES_DIR = path.join(WORKSPACE_ROOT, 'clothes');
const SITE_SRC_DIR = path.join(WORKSPACE_ROOT, 'new images');

const IMAGE_RE = /\.(jpe?g|png|webp|avif|gif)$/i;

function storedName(original) {
  const ext = path.extname(original).toLowerCase();
  const base =
    path
      .basename(original, path.extname(original))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'image';
  return `${base}${ext}`;
}

function listImages(dir) {
  try {
    return fs.readdirSync(dir).filter((f) => IMAGE_RE.test(f));
  } catch {
    return [];
  }
}

/**
 * Manifest of product images: every file in the workspace `clothes/` folder
 * mapped to its stored filename and absolute served URL. Computed at import so
 * products.js can build catalog entries that always match the copied files.
 */
export const PRODUCT_IMAGE_MANIFEST = listImages(CLOTHES_DIR).map((original) => {
  const stored = storedName(original);
  return {
    original,
    stored,
    url: `${apiPublicUrl()}${UPLOADS_URL_PREFIX}/products/${encodeURIComponent(stored)}`,
  };
});

// Copy one file only when missing or stale (size differs) — keeps re-seeding fast.
function copyIfNeeded(src, dest) {
  try {
    if (fs.existsSync(dest) && fs.statSync(dest).size === fs.statSync(src).size) return false;
    fs.copyFileSync(src, dest);
    return true;
  } catch (err) {
    console.warn(`  ⚠ could not copy ${path.basename(src)}: ${err.message}`);
    return false;
  }
}

/**
 * Idempotently copy local workspace assets into the backend upload store so the
 * backend serves them itself (no dependency on the sibling `clothes/` folder at
 * runtime). Returns counts for logging. Safe to run on every seed.
 */
export function copyLocalAssets() {
  ensureUploadDirs();

  let products = 0;
  for (const { original, stored } of PRODUCT_IMAGE_MANIFEST) {
    if (copyIfNeeded(path.join(CLOTHES_DIR, original), path.join(PRODUCTS_UPLOAD_DIR, stored))) {
      products += 1;
    }
  }

  let site = 0;
  for (const original of listImages(SITE_SRC_DIR)) {
    if (copyIfNeeded(path.join(SITE_SRC_DIR, original), path.join(SITE_UPLOAD_DIR, original))) {
      site += 1;
    }
  }

  return { products, site, totalProductImages: PRODUCT_IMAGE_MANIFEST.length };
}
