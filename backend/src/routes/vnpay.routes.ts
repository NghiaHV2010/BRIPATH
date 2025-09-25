import { Router } from 'express';
import {
    validateCreateOrderRequest,
    validateQueryOrderRequest
} from '../middlewares/vnpay.middleware';
import {
    createPaymentUrl,
    handleReturn,
    handleIPN,
    queryOrder
} from '../controllers/vnpay.controller';

const vnPayRouter = Router();

vnPayRouter.post('/create-payment-url', validateCreateOrderRequest, createPaymentUrl);

vnPayRouter.get('/return', handleReturn);

vnPayRouter.get('/ipn', handleIPN);

vnPayRouter.post('/query', validateQueryOrderRequest, queryOrder);


export default vnPayRouter;
