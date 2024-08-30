import express, { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import authenticateJWT from './middlewares/auth';
import eventRoutes from './routes/eventRoutes';
import userRoutes from './routes/userRoutes';

// Initialize Express and Prisma Client
const app = express();
const prisma = new PrismaClient();

app.use(express.json());