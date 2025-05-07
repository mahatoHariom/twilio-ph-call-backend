import express from "express";
import * as twilioController from "../controllers/twilioController";

const router = express.Router();

router.post("/token", twilioController.generateToken);
router.post("/voice", twilioController.voiceResponse);
router.post("/incoming", twilioController.incomingCall);

export default router;