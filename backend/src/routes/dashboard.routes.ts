import { Router } from 'express';
import { getRevenueStats, getPaymentStats, getUserAccessStats, getCompaniesByStatus, getEventsByStatus, updateEventStatus, updateCompanyStatus, createJobLabel, createCompanyLabel } from '../controllers/dashboard.controller';
import { authenticationMiddleware, authorizationMiddleware } from '../middlewares/auth.middleware';

const dashboardRouter = Router();

// Apply auth middleware to all routes
dashboardRouter.use(authenticationMiddleware);

// Dashboard routes
dashboardRouter.get('/revenue', authorizationMiddleware('Admin'), getRevenueStats);
dashboardRouter.get('/payments', authorizationMiddleware('Admin'), getPaymentStats);
dashboardRouter.get('/users', authorizationMiddleware('Admin'), getUserAccessStats);

dashboardRouter.post('/job-labels', authorizationMiddleware('Admin'), createJobLabel);
dashboardRouter.post('/company/labels', authorizationMiddleware('Admin'), createCompanyLabel);

dashboardRouter.get('/company', authorizationMiddleware('Admin'), getCompaniesByStatus);
dashboardRouter.get('/event', authorizationMiddleware('Admin'), getEventsByStatus);
dashboardRouter.put('/event/:eventId', authorizationMiddleware('Admin'), updateEventStatus);
dashboardRouter.put('/company/:companyId', authorizationMiddleware('Admin'), updateCompanyStatus);

export default dashboardRouter;
