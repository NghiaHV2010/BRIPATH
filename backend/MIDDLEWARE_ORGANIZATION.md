# Middleware Organization

## Overview
Middleware has been refactored into separate, organized files for better maintainability and reusability.

## Structure

### **Timeout Middleware** (`timeout.middleware.ts`)
```typescript
import { timeoutMiddleware, customTimeoutMiddleware } from './middlewares';

// Default timeout (from env config)
app.use(timeoutMiddleware);

// Custom timeout for specific routes
app.use('/api/heavy-operation', customTimeoutMiddleware(60000)); // 60 seconds
```

**Features:**
- ✅ Configurable timeout via environment variables
- ✅ Custom timeout for specific routes
- ✅ Proper error handling with HTTP 408 status
- ✅ Request and response timeout protection

### **Rate Limiting Middleware** (`rateLimit.middleware.ts`)
```typescript
import { 
    generalLimiter, 
    authLimiter, 
    apiLimiter, 
    strictLimiter, 
    createRateLimiter 
} from './middlewares';

// Apply to all routes
app.use(generalLimiter);

// Apply to auth routes
app.use('/api/auth', authLimiter);

// Apply to API routes
app.use('/api/data', apiLimiter);

// Apply to sensitive operations
app.use('/api/admin', strictLimiter);

// Create custom rate limiter
const customLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50, // 50 requests
    message: 'Custom rate limit exceeded',
    errorCode: 'CUSTOM_LIMIT'
});
```

**Available Limiters:**
- **generalLimiter**: 1000 requests/15min (all routes)
- **authLimiter**: 20 requests/15min (authentication)
- **apiLimiter**: 100 requests/1min (API endpoints)
- **strictLimiter**: 5 requests/15min (sensitive operations)
- **createRateLimiter**: Custom rate limiter factory

## Usage Examples

### **Basic Setup** (index.ts)
```typescript
import { 
    errorMiddleware, 
    timeoutMiddleware, 
    generalLimiter, 
    authLimiter, 
    apiLimiter 
} from './middlewares';

const app = express();

// Apply middleware in order
app.use(timeoutMiddleware);
app.use(generalLimiter);
app.use(express.json());

// Route-specific rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Error handling (last)
app.use(errorMiddleware);
```

### **Custom Timeout for Specific Routes**
```typescript
import { customTimeoutMiddleware } from './middlewares';

// File upload with longer timeout
app.post('/api/upload', 
    customTimeoutMiddleware(120000), // 2 minutes
    uploadController
);

// AI processing with extended timeout
app.post('/api/ai/analyze', 
    customTimeoutMiddleware(300000), // 5 minutes
    aiController
);
```

### **Progressive Rate Limiting**
```typescript
import { authLimiter, apiLimiter, strictLimiter } from './middlewares';

// Authentication endpoints - strict
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Regular API endpoints - moderate
app.use('/api/jobs', apiLimiter);
app.use('/api/companies', apiLimiter);

// Admin endpoints - very strict
app.use('/api/admin', strictLimiter);
```

## Configuration

### **Environment Variables**
```env
# Timeout configuration
REQUEST_TIMEOUT_MS=30000

# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=1000         # General limit
RATE_LIMIT_AUTH_MAX=20               # Auth limit
RATE_LIMIT_API_MAX=100               # API limit
```

### **Middleware Options**

#### **Timeout Middleware**
- `REQUEST_TIMEOUT_MS`: Default timeout for all requests
- Custom timeout: `customTimeoutMiddleware(milliseconds)`

#### **Rate Limiting**
- `windowMs`: Time window for rate limiting
- `max`: Maximum requests per window
- `message`: Custom error message
- `errorCode`: Custom error code for identification

## Error Responses

### **Timeout Errors**
```json
{
  "success": false,
  "message": "Yêu cầu hết thời gian chờ - Máy chủ mất quá nhiều thời gian để phản hồi",
  "error": "REQUEST_TIMEOUT",
  "timeout": 30000
}
```

### **Rate Limit Errors**
```json
{
  "success": false,
  "message": "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.",
  "retryAfter": "15 phút",
  "error": "RATE_LIMIT_EXCEEDED",
  "limit": 1000,
  "window": "15 phút"
}
```

## Benefits

### **Organization**
- 🗂️ **Separated Concerns**: Each middleware has its own file
- 🔄 **Reusable**: Easy to import and use across routes
- 📝 **Maintainable**: Clear structure and documentation
- 🧪 **Testable**: Individual middleware can be tested separately

### **Flexibility**
- ⚙️ **Configurable**: Environment-based configuration
- 🎯 **Targeted**: Different limits for different endpoints
- 🏗️ **Extensible**: Easy to add new rate limiters
- 🔧 **Customizable**: Factory functions for custom middleware

### **Production Ready**
- 🛡️ **Security**: Protection against abuse and attacks
- 📊 **Monitoring**: Detailed logging and error tracking
- ⚡ **Performance**: Optimized for high-traffic scenarios
- 🚀 **Scalable**: Handles large numbers of concurrent requests

## Migration

### **Before** (all in index.ts)
```typescript
// 100+ lines of middleware configuration mixed with app setup
app.use((req, res, next) => { /* timeout logic */ });
const rateLimiter = rateLimit({ /* config */ });
```

### **After** (clean separation)
```typescript
// Clean, organized imports
import { timeoutMiddleware, generalLimiter } from './middlewares';

app.use(timeoutMiddleware);
app.use(generalLimiter);
```

The middleware is now modular, maintainable, and production-ready! 🚀