import { Router } from 'express';
import { getRevenueStats, getPaymentStats, getUserAccessStats, getCompaniesByStatus, getEventsByStatus, updateEventStatus, updateCompanyStatus } from '../controllers/dashboard.controller';
import { authenticationMiddleware, authorizationMiddleware } from '../middlewares/auth.middleware';

const dashboardRouter = Router();

// Apply auth middleware to all routes
dashboardRouter.use(authenticationMiddleware);

// Dashboard routes
dashboardRouter.get('/revenue', getRevenueStats);
dashboardRouter.get('/payments', getPaymentStats);
dashboardRouter.get('/users', getUserAccessStats);



dashboardRouter.get('/company', authorizationMiddleware('Admin'), getCompaniesByStatus);
dashboardRouter.get('/event', authorizationMiddleware('Admin'), getEventsByStatus);
dashboardRouter.put('/event/:eventId', authorizationMiddleware('Admin'), updateEventStatus);
dashboardRouter.put('/company/:companyId', authorizationMiddleware('Admin'), updateCompanyStatus);

export default dashboardRouter;
