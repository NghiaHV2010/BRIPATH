import { Router } from 'express';
import {
    createPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment
} from '../controllers/payment.controller';
import { authenticationMiddleware } from '../middlewares/auth.middleware';
import { validateCreatePaymentRequest, validateUpdatePaymentRequest } from '../middlewares/payment.middleware';

const paymentRouter = Router();

// Apply auth middleware to all routes
paymentRouter.use(authenticationMiddleware);

// Payment routes
paymentRouter.post('/', validateCreatePaymentRequest, createPayment);
paymentRouter.get('/', getPayments);
paymentRouter.get('/:id', getPaymentById);
paymentRouter.put('/:id', validateUpdatePaymentRequest, updatePayment);
paymentRouter.delete('/:id', deletePayment);

export default paymentRouter;
