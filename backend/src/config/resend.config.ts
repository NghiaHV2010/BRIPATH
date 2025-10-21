import { Resend } from 'resend';
import { RESEND_API_KEY, NODE_ENV } from './env.config';

// Initialize Resend with API key
const resend = new Resend(RESEND_API_KEY);

// Verify API key on startup in production
if (NODE_ENV === 'production') {
    console.log('Initializing Resend email service...');

    // Check if API key is configured
    if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not configured!');
    } else {
        console.log('Resend API key configured successfully');
    }
}

export default resend;