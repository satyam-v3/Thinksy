import { Router } from 'express';
import { authController } from '../../controllers/auth.controller';
import { asyncHandler } from '../../middleware/asyncHandler';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(authController.register));
authRouter.post('/login', asyncHandler(authController.login));