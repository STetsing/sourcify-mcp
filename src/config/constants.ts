import dotenv from 'dotenv';

dotenv.config();

export const SOURCIFY_BASE_URL = process.env.SOURCIFY_BASE_URL || 'https://sourcify.dev/server';
export const API_TIMEOUT = parseInt(process.env.API_TIMEOUT || '30000', 10);
export const PORT = parseInt(process.env.PORT || '3000', 10);
export const HOST = process.env.HOST || 'localhost';
export const ALLOWED_HOSTS = process.env.ALLOWED_HOSTS?.split(',') || [];
