import nodemailer from 'nodemailer';
import { GMAIL_APP_PASSWORD, GMAIL_USER, NODE_ENV } from './env.config';

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
    // Production optimizations
    pool: true, // Use connection pooling
    maxConnections: 5, // Limit concurrent connections
    maxMessages: 100, // Limit messages per connection
    rateDelta: 20000, // 20 seconds rate limiting window
    rateLimit: 5, // Max 5 emails per rateDelta
    // Security and timeout settings
    secure: true, // Use TLS
    tls: {
        rejectUnauthorized: true
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000, // 30 seconds
    socketTimeout: 60000, // 60 seconds
    // Debugging for production issues
    debug: NODE_ENV === 'development',
    logger: NODE_ENV === 'development',
});

// Verify connection configuration on startup
if (NODE_ENV === 'production') {
    transporter.verify((error: any, success: any) => {
        if (error) {
            console.error('SMTP connection verification failed:', error);
        } else {
            console.log('SMTP server is ready to take our messages');
        }
    });
}

export default transporter;