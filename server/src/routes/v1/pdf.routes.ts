import { Router, type RequestHandler } from 'express';

import { pdfController } from '../../controllers/pdf.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { pdfUpload } from '../../middleware/upload';
import { requireAuth } from '../../middleware/auth';

export const pdfRouter = Router();

pdfRouter.post(
  '/upload',
  requireAuth,
  pdfUpload.single('pdf') as unknown as RequestHandler,
  asyncHandler(pdfController.upload),
);