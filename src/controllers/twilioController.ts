import { Request, Response } from "express";
import twilio from "twilio";
import { config } from "../config";

// Generate an access token for Twilio Voice SDK
export const generateToken = (req: Request, res: Response) => {
  const identity = req.body.identity || "user";

  try {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    // Create a Voice grant for this token
    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: config.twilio.appSid,
      incomingAllow: true,
    });

    // Create an access token
    const token = new AccessToken(
      config.twilio.accountSid,
      config.twilio.apiKey,
      config.twilio.apiSecret,
      { identity }
    );

    // Add the Voice grant to the token
    token.addGrant(voiceGrant);

    // Return the token
    res.json({
      token: token.toJwt(),
      identity,
    });
  } catch (error) {
    console.error("Error generating token", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
};

// Create TwiML to handle outgoing calls
export const voiceResponse = (req: Request, res: Response) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const to = req.body.to;

  const twiml = new VoiceResponse();

  if (to) {
    // Connect to client with the given identifier
    const dial = twiml.dial();
    dial.client(to);
  } else {
    twiml.say("Thanks for calling. Please specify a valid destination.");
  }

  // Send TwiML as the response
  res.type("text/xml");
  res.send(twiml.toString());
};

// Incoming call webhook
export const incomingCall = (req: Request, res: Response) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  // Answer the call and play a welcome message
  twiml.say("Incoming call to the VOIP application.");

  // Connect the call to a client
  const dial = twiml.dial();
  dial.client("support"); // This connects to a client with identity 'support'

  res.type("text/xml");
  res.send(twiml.toString());
};
