import { Router } from 'express';
import {
    validateCreateOrderRequest,
    validateQueryOrderRequest
} from '../middlewares/zalopay.middleware';
import {
    createOrder,
    queryOrder,
    handleCallback
} from '../controllers/zalopay.controller';

const zaloPayRouter = Router();

zaloPayRouter.post('/create-order', validateCreateOrderRequest, createOrder);

zaloPayRouter.get('/query-order/:app_trans_id', validateQueryOrderRequest, queryOrder);


zaloPayRouter.post('/callback', handleCallback);



export default zaloPayRouter;