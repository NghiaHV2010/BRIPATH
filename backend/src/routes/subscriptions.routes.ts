import { Router } from 'express';
import { getUserSubscription } from '../controllers/subscription.controller';
import { authenticationMiddleware } from '../middlewares/auth.middleware';

const subscriptionsRouter = Router();

subscriptionsRouter.use(authenticationMiddleware);

subscriptionsRouter.get('/user/:userId', getUserSubscription);

export default subscriptionsRouter;


