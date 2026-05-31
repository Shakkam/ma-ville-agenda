import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { put } from '@vercel/blob';
import { authMiddleware } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

export const uploadRouter = Router();

// Local disk dir used only when Vercel Blob is not configured (dev).
export const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

// Keep the file in memory so we can route it to either Blob or disk.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG, WebP or GIF images are allowed'));
    }
  },
});

const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

// POST /api/upload - upload a single image (field "image"). Auth required.
uploadRouter.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'NO_FILE', 'No image file provided');
  }

  const ext = EXT_BY_MIME[req.file.mimetype] || '.jpg';
  const filename = `events/${crypto.randomUUID()}${ext}`;

  if (useBlob()) {
    // Production: store in Vercel Blob, return its public URL.
    const blob = await put(filename, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
    });
    res.status(201).json({ url: blob.url });
    return;
  }

  // Dev fallback: write to local disk and return a localhost URL.
  const diskName = path.basename(filename);
  fs.writeFileSync(path.join(UPLOADS_DIR, diskName), req.file.buffer);
  const url = `${req.protocol}://${req.get('host')}/uploads/${diskName}`;
  res.status(201).json({ url });
});
