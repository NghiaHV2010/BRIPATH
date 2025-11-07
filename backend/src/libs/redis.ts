const Redis = require("ioredis");

import { createRequire } from 'module';
import { REDIS_URL } from '../config/env.config';

// URL kết nối sẽ lấy từ biến môi trường
// Khi deploy, đây sẽ là URL của managed Redis service
// Khi ở local, nó có thể là 'redis://localhost:6379'
const redisUrl = REDIS_URL;

// Tạo một instance duy nhất
// ioredis sẽ tự động quản lý kết nối và tự động kết nối lại
export const redis = new Redis(redisUrl, {
    // Tùy chọn này giúp tránh lỗi khi Redis chưa sẵn sàng
    maxRetriesPerRequest: null,
});

redis.on('connect', () => {
    console.log('✅ Connected to Redis successfully!');
});

redis.on('error', (err) => {
    console.error('❌ Could not connect to Redis:', err);
});