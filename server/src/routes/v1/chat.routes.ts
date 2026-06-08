import { Router } from 'express';

import { chatController } from '../../controllers/chat.controller';
import { asyncHandler } from '../../middleware/asyncHandler';
import { requireAuth } from '../../middleware/auth';

export const debugRouter = Router();
debugRouter.get(
    '/vectors',
    requireAuth,
    asyncHandler(chatController.debugVectors),
);

export const chatRouter = Router();

chatRouter.post(
    '/query',
    requireAuth,
    asyncHandler(chatController.query),
);

chatRouter.post(
    '/stream',
    requireAuth, 
    asyncHandler(chatController.stream),
);