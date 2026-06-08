import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model'; // 👈 Using your exact model
import { ApiError } from '../utils/ApiError';

const generateToken = (id: string) => {
    // This secret must match the one in your requireAuth middleware
    return jwt.sign({ id }, process.env.JWT_SECRET || 'default_jwt_secret_change_in_production', {
        expiresIn: '7d',
    });
};

export const authController = {
    register: async (req: Request, res: Response) => {
        const { email, password } = req.body;

        if (!email || !password) {
            throw ApiError.badRequest('Email and password are required');
        }

        const userExists = await UserModel.findOne({ email });
        if (userExists) {
            throw ApiError.badRequest('User already exists with this email');
        }

        // Hash the password to match your schema's passwordHash field
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create the user using your exact schema fields
        const user = await UserModel.create({
            email,
            passwordHash
        });

        const token = generateToken(user._id.toString());

        res.status(201).json({
            success: true,
            user: { id: user._id, email: user.email },
            token,
        });
    },

    login: async (req: Request, res: Response) => {
        const { email, password } = req.body;

        if (!email || !password) {
            throw ApiError.badRequest('Email and password are required');
        }

        // Find the user
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw ApiError.badRequest('Invalid email or password');
        }

        // Compare the raw password with the stored passwordHash
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw ApiError.badRequest('Invalid email or password');
        }

        const token = generateToken(user._id.toString());

        res.json({
            success: true,
            user: { id: user._id, email: user.email },
            token,
        });
    },
};