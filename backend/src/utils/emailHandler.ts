import resend from "../config/resend.config";

/**
 * Validate email
 * @param email - chuỗi email cần validate
 * @returns true nếu email hợp lệ, false nếu không
 */
export function validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
}

export async function sendEmail(email: string, subject: string, content: string): Promise<boolean> {
    try {
        // Validate inputs
        if (!email || !validateEmail(email)) {
            console.error('Invalid email address:', email);
            throw new Error('Invalid email address');
        }

        if (!subject || !content) {
            console.error('Missing subject or content');
            throw new Error('Missing subject or content');
        }

        // Log email attempt (without sensitive data)
        console.log(`Attempting to send email to: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

        const { data, error } = await resend.emails.send({
            from: 'BRIPATH <no-reply@bripath.online>', // Use resend's test domain for now
            to: [email],
            subject: subject,
            html: content,
        });

        if (error) {
            console.error('Email sending failed:', {
                error: error.message || error,
                to: email.replace(/(.{2}).*(@.*)/, '$1***$2')
            });

            // Return a more specific error message based on error type
            if (error.message?.includes('API key')) {
                throw new Error('Email authentication failed - check API key');
            } else if (error.message?.includes('rate limit')) {
                throw new Error('Email rate limit exceeded');
            } else if (error.message?.includes('domain')) {
                throw new Error('Email domain not verified');
            } else {
                throw new Error(`Email sending failed: ${error.message || 'Unknown error'}`);
            }
        }

        console.log('Email sent successfully:', {
            id: data?.id,
            to: email.replace(/(.{2}).*(@.*)/, '$1***$2')
        });

        return true;

    } catch (error) {
        const err = error as Error;
        console.error('Email sending error:', err.message);
        throw err;
    }
}

// Enhanced email sending with retry mechanism for production
export async function sendEmailWithRetry(
    email: string,
    subject: string,
    content: string,
    maxRetries: number = 3
): Promise<boolean> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Email sending attempt ${attempt}/${maxRetries} to: ${email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);

            await sendEmail(email, subject, content);
            console.log(`Email sent successfully on attempt ${attempt}`);
            return true;

        } catch (error) {
            lastError = error as Error;
            console.error(`Email sending attempt ${attempt} failed:`, lastError.message);

            // Don't retry for authentication errors or domain verification issues
            if (lastError.message.includes('authentication failed') ||
                lastError.message.includes('domain not verified') ||
                lastError.message.includes('API key')) {
                throw lastError;
            }

            // Wait before retrying (exponential backoff)
            if (attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
                console.log(`Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    throw new Error(`Email sending failed after ${maxRetries} attempts: ${lastError!.message}`);
}