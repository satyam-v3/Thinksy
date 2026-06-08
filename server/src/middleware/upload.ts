import path from 'node:path';
import multer, { type FileFilterCallback } from 'multer';
import type { Request } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import { config } from '../config';
import { ApiError } from '../utils/ApiError';

/**
 * Configure Cloudinary
 * Make sure these variables exist in your .env file!
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const sanitize = (name: string): string =>
  path
    .basename(name)
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .slice(0, 100) || 'file';

/**
 * Multer storage engine for Cloudinary.
 * Using resource_type: 'raw' is required for non-image files like PDFs.
 */
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'thinksy_pdfs',
    resource_type: 'raw',
    // format: 'pdf',
    public_id: (_req: Request, file: Express.Multer.File) => {
      const safeBase = sanitize(file.originalname).replace(/\.pdf$/i, '');
      const stamp = Date.now();
      return `${stamp}-${safeBase}`;
    },
  } as any,
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