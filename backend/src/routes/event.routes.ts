import { Router } from "express";
import { createEvent, getAllEvents } from "../controllers/event.controller";
import { authenticationMiddleware } from "../middlewares/auth.middleware";

const eventRouter = Router();

eventRouter.get('/events', getAllEvents);
eventRouter.post('/upload/event', authenticationMiddleware, createEvent);

export default eventRouter;