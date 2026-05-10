import { Router } from 'express';

import { chatController } from '../../controllers/chat.controller';
import { asyncHandler } from '../../middleware/asyncHandler';

export const debugRouter = Router();
debugRouter.get(
    '/vectors',
    asyncHandler(chatController.debugVectors),
);

export const chatRouter = Router();

chatRouter.post('/query', asyncHandler(chatController.query));
