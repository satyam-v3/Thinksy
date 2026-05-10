import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';

import { config } from '../config';
import { ApiError } from '../utils/ApiError';

/**
 * Multer upload middleware for PDF files.
 *
 * - Stores files on disk under `config.uploadDir`.
 * - Filename: `<unix-ms>-<8 hex>-<sanitized-original>.pdf` to avoid collisions.
 * - Rejects anything that is not `application/pdf` (also re-checks extension).
 * - Caps file size at `config.maxUploadBytes`.
 *
 * Errors raised here propagate through Express; the centralized error
 * middleware translates `MulterError` instances into `ApiError` responses.
 */

// Ensure upload directory exists at startup so multer doesn't fail on first request.
fs.mkdirSync(config.uploadDir, { recursive: true });

const sanitize = (name: string): string =>
  path
    .basename(name)
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 100) || 'file';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  filename: (_req, file, cb) => {
    const safeBase = sanitize(file.originalname).replace(/\.pdf$/i, '');
    const stamp = Date.now();
    const rand = crypto.randomBytes(4).toString('hex');
    cb(null, `${stamp}-${rand}-${safeBase}.pdf`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';
  if (!isPdfMime || !isPdfExt) {
    cb(ApiError.badRequest('Only PDF files are allowed', { mimetype: file.mimetype }));
    return;
  }
  cb(null, true);
};

export const pdfUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxUploadBytes,
    files: 1,
  },
});