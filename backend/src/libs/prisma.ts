import { PrismaClient } from '@prisma/client';
import { DATABASE_URL, NODE_ENV } from '../config/env.config';

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
        datasources: {
            db: {
                url: DATABASE_URL, // Truyền trực tiếp chuỗi kết nối vào đây
            },
        },
    });

// Đây là một mẹo để tránh tạo nhiều instance khi
// code thay đổi ở môi trường development (hot-reloading)
if (NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}