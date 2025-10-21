import { Router } from 'express';
import {
  createSePayOrder,
  querySePayOrder,
  handleSePayWebhook,
  getSePayInstructions,
  checkPaymentStatus,
  cancelSePayOrder,
  cancelAllPendingOrders
} from '../controllers/sepay.controller';
import { authenticationMiddleware } from '../middlewares/auth.middleware';

const sepayRouter = Router();

// Public webhook endpoint (no auth required)
sepayRouter.post('/webhook', handleSePayWebhook);

// Protected routes
sepayRouter.use(authenticationMiddleware);

// SePay order routes
sepayRouter.post('/create-order', createSePayOrder);
sepayRouter.delete('/cancel/:orderId', cancelSePayOrder);
sepayRouter.delete('/cancel-all', cancelAllPendingOrders);
sepayRouter.get('/query/:orderId', querySePayOrder);
sepayRouter.get('/instructions', getSePayInstructions);
sepayRouter.get('/status/:orderId', checkPaymentStatus);

export default sepayRouter;
