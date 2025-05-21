import express, { Router } from "express";
import * as reservationController from "../controllers/reservationController";

const router: Router = express.Router();

// Create a new reservation
router.post("/", reservationController.createReservation);

// Get all reservations for a user
router.get("/user/:username", reservationController.getUserReservations);

// Get reservation by ID
router.get("/:id", reservationController.getReservationById);

// Update reservation
router.put("/:id", reservationController.updateReservation);

// Check and update expired reservations (used by client periodically)
router.post("/update-expired", reservationController.updateExpiredReservations);

export default router;
