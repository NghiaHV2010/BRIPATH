import { Router } from "express";
import { getAllBlogs, getBlogById } from "../controllers/dashboard.controller";

const blogRouter = Router();

// Public routes (no auth)
blogRouter.get('/blogs', getAllBlogs);
blogRouter.get('/blogs/:blogId', getBlogById);

export default blogRouter;