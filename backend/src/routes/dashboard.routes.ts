import { Router } from 'express';
import { getRevenueStats, getPaymentStats, getUserAccessStats, getCompaniesByStatus, getEventsByStatus, updateEventStatus, updateCompanyStatus, createJobLabel, createCompanyLabel, createBlogPost, updateBlogPost, deleteBlogPost, getAllBlogs, getBlogById } from '../controllers/dashboard.controller';
import { authenticationMiddleware, authorizationMiddleware } from '../middlewares/auth.middleware';

const dashboardRouter = Router();

// Public routes (no auth)
dashboardRouter.get('/blogs', getAllBlogs);
dashboardRouter.get('/blogs/:blogId', getBlogById);

// Apply auth middleware to all subsequent routes
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

dashboardRouter.post('/blog', authorizationMiddleware('Admin'), createBlogPost);
dashboardRouter.put('/blog/:blogId', authorizationMiddleware('Admin'), updateBlogPost);
dashboardRouter.delete('/blog/:blogId', authorizationMiddleware('Admin'), deleteBlogPost);

export default dashboardRouter;
