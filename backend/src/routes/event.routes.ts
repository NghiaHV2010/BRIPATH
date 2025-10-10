import { Router } from "express";
import { createEvent, deleteEvent, getAllEvents, getEventsByUserId, getVolunteersByStatus, updateEvent, updateVolunteerStatus } from "../controllers/event.controller";
import { authenticationMiddleware, eventAuthMiddleware } from "../middlewares/auth.middleware";

const eventRouter = Router();

eventRouter.get('/events', getAllEvents);

eventRouter.post('/event', authenticationMiddleware, eventAuthMiddleware, createEvent);
eventRouter.put('/event/:eventId', authenticationMiddleware, eventAuthMiddleware, updateEvent);
eventRouter.delete('/event/:eventId', authenticationMiddleware, deleteEvent);

eventRouter.get('/volunteers', authenticationMiddleware, getVolunteersByStatus);
eventRouter.put('/volunteer/:volunteerId', authenticationMiddleware, updateVolunteerStatus);

eventRouter.get('/events/:userId', authenticationMiddleware, getEventsByUserId);

export default eventRouter;