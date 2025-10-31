import { Router } from 'express';
import { getRevenueStats, getPaymentStats, getUserAccessStats, getCompaniesByStatus, getEventsByStatus, updateEventStatus, updateCompanyStatus, createJobLabel, createCompanyLabel, createBlogPost, updateBlogPost, deleteBlogPost, getAllReports, updateReportStatus } from '../controllers/dashboard.controller';
import { authenticationMiddleware, authorizationMiddleware } from '../middlewares/auth.middleware';

const dashboardRouter = Router();

// Apply auth middleware to all routes
dashboardRouter.use(authenticationMiddleware);
dashboardRouter.use(authorizationMiddleware('Admin'));

// Dashboard routes
dashboardRouter.get('/revenue', getRevenueStats);
dashboardRouter.get('/payments', getPaymentStats);
dashboardRouter.get('/users', getUserAccessStats);

dashboardRouter.post('/job-labels', createJobLabel);
dashboardRouter.post('/company/labels', createCompanyLabel);

dashboardRouter.get('/company', getCompaniesByStatus);
dashboardRouter.get('/event', getEventsByStatus);
dashboardRouter.put('/event/:eventId', updateEventStatus);
dashboardRouter.put('/company/:companyId', updateCompanyStatus);

dashboardRouter.post('/blog', createBlogPost);
dashboardRouter.put('/blog/:blogId', updateBlogPost);
dashboardRouter.delete('/blog/:blogId', deleteBlogPost);

dashboardRouter.get('/reports', getAllReports);
dashboardRouter.put('/report/:reportId', updateReportStatus);

export default dashboardRouter;
