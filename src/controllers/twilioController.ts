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

  // Log all request parameters for debugging
  console.log("Voice request received with body:", req.body);

  // The 'To' parameter might be in different formats depending on how it's sent
  // It can be req.body.To (from frontend) or params.To (from Twilio URL encoding)
  const to = req.body.To || req.query.To || req.body.to;
  const from = req.body.From || req.query.From || req.body.from;

  console.log(`Attempting to connect call - To: ${to}, From: ${from}`);

  const twiml = new VoiceResponse();

  if (to) {
    console.log(`Dialing to client: ${to}`);
    // Connect to client with the given identifier
    const dial = twiml.dial({
      callerId: from || "client:anonymous", // Set the caller ID
    });
    dial.client(to);
  } else {
    console.log("No destination specified, playing message");
    twiml.say("Thanks for calling. Please specify a valid destination.");
  }

  // Log the generated TwiML for debugging
  const twimlString = twiml.toString();
  console.log("Generated TwiML:", twimlString);

  // Send TwiML as the response
  res.type("text/xml");
  res.send(twimlString);
};

// Incoming call webhook
export const incomingCall = (req: Request, res: Response) => {
  // Log all request parameters for debugging
  console.log("Incoming call request received with body:", req.body);

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  // Answer the call and play a welcome message
  twiml.say("Incoming call to the VOIP application.");

  // Get the To parameter if available, otherwise use "support"
  const to = req.body.To || req.query.To || "support";
  console.log(`Routing incoming call to: ${to}`);

  // Connect the call to a client
  const dial = twiml.dial();
  dial.client(to);

  // Log the generated TwiML for debugging
  const twimlString = twiml.toString();
  console.log("Generated TwiML for incoming call:", twimlString);

  res.type("text/xml");
  res.send(twimlString);
};
