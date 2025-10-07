import { Router } from "express";
import { createEvent, getAllEvents, getEventsByUserId, getVolunteersByStatus, updateVolunteerStatus } from "../controllers/event.controller";
import { authenticationMiddleware, eventAuthMiddleware } from "../middlewares/auth.middleware";

const eventRouter = Router();

eventRouter.get('/events', getAllEvents);
eventRouter.post('/event/upload', authenticationMiddleware, eventAuthMiddleware, createEvent);

eventRouter.get('/volunteers', authenticationMiddleware, getVolunteersByStatus);
eventRouter.put('/volunteer/:volunteerId', authenticationMiddleware, updateVolunteerStatus);

eventRouter.get('/events/:userId', authenticationMiddleware, getEventsByUserId);

export default eventRouter;