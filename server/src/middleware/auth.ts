import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the standard Express Request to include our authenticated user payload
export interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const requireAuth = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header exists and is formatted correctly
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'Authentication required. No token provided.'
        });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        // Verify the token using your secret key
        const secret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
        const decoded = jwt.verify(token, secret) as { id: string };

        // Attach the user ID to the request object so downstream controllers can use it
        req.user = { id: decoded.id };

        next(); // Pass control to the next middleware or route handler
    } catch (error) {
        console.error('JWT Verification failed:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};