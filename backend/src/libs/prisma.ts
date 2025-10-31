// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { NODE_ENV } from '../config/env.config';

// Khai báo một biến toàn cục để lưu trữ instance
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Tạo instance
export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        // (Tùy chọn) Bật log để xem các query khi ở môi trường dev
        // log: ['query', 'info', 'warn', 'error'],
    });

// Đây là một mẹo để tránh tạo nhiều instance khi
// code thay đổi ở môi trường development (hot-reloading)
if (NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}