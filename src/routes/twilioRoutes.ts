import express, { Router } from "express";
import * as twilioController from "../controllers/twilioController";

const router: Router = express.Router();

router.post("/token", twilioController.generateToken);
router.post("/voice", twilioController.voiceResponse);
router.post("/incoming", twilioController.incomingCall);
router.post("/status", twilioController.callStatus);

export default router;
