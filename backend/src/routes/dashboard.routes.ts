import { Router } from 'express';
import { getRevenueStats, getPaymentStats, getUserAccessStats } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const dashboardRouter = Router();

// Apply auth middleware to all routes
dashboardRouter.use(authMiddleware);

// Dashboard routes
dashboardRouter.get('/revenue', getRevenueStats);
dashboardRouter.get('/payments', getPaymentStats);
dashboardRouter.get('/users', getUserAccessStats);

export default dashboardRouter;
