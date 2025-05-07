import express from 'express';
import * as twilioController from '../controllers/twilioController';

const router = express.Router();

// Route to generate a token for the Twilio Voice SDK
router.post('/token', twilioController.generateToken);

// Route for outgoing voice calls
router.post('/voice', twilioController.voiceResponse);

// Route for incoming voice calls
router.post('/incoming', twilioController.incomingCall);

export default router; 