import { Router, type RequestHandler } from 'express';

import { pdfController } from '../../controllers/pdf.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { pdfUpload } from '../../middleware/upload';

/**
 * PDF routes.
 *   POST /api/v1/pdf/upload   — multipart/form-data, field name: \"file\"
 *
 * Multer runs first and attaches the parsed file to `req.file`. The
 * controller then delegates to `pdfService` and shapes the response.
 */
export const pdfRouter = Router();

pdfRouter.post(
  '/upload',
  pdfUpload.single('pdf') as unknown as RequestHandler,
  asyncHandler(pdfController.upload),
);

// pdfRouter.post(
//   '/test-chunk',
//   asyncHandler(pdfController.testChunking),
// );