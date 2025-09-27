import { Router } from 'express';
import { getRevenueStats, getPaymentStats } from '../controllers/dashboard.controller';
import { authenticationMiddleware } from '../middlewares/auth.middleware';

const dashboardRouter = Router();

// Apply auth middleware to all routes
dashboardRouter.use(authenticationMiddleware);

// Dashboard routes
dashboardRouter.get('/revenue', getRevenueStats);
dashboardRouter.get('/payments', getPaymentStats);

export default dashboardRouter;
