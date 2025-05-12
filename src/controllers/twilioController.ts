import { Request, Response } from "express";
import twilio from "twilio";
import { config } from "../config";
import logger from "../utils/logger";

export const generateToken = (req: Request, res: Response): void => {
  const identity = req.body.identity || "user";

  try {
    const { AccessToken } = twilio.jwt;
    const { VoiceGrant } = AccessToken;

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: config.twilio.appSid,
      incomingAllow: true,
    });

    const token = new AccessToken(
      config.twilio.accountSid,
      config.twilio.apiKey,
      config.twilio.apiSecret,
      { identity, ttl: 3600 } // Set token expiration to 1 hour
    );
    token.addGrant(voiceGrant);

    logger.info(`Generated token for identity: ${identity}`);
    res.json({ token: token.toJwt(), identity });
  } catch (error) {
    logger.error("Error generating token", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
};

export const voiceResponse = (req: Request, res: Response): void => {
  const { twiml } = twilio;
  const response = new twiml.VoiceResponse();

  // Extract parameters from request
  const to = req.body.To || req.query.To;
  const from = req.body.From || req.query.From || "client:anonymous";
  // Use the from value as callerId if it's not a client identifier
  const callerId = from.startsWith("client:") ? from : from;

  logger.info(`Voice request: To=${to}, From=${from}`);

  try {
    if (!to) {
      logger.warn("No 'To' parameter provided in voice request");
      response.say(
        {
          voice: "alice",
          language: "en-US",
        },
        "No destination specified. Please provide a valid destination."
      );
      res.type("text/xml").send(response.toString());
      return;
    }

    // Handle different call scenarios
    if (to.startsWith("client:")) {
      // Direct client-to-client call
      const clientId = to.replace("client:", "");
      logger.info(`Dialing to client: ${clientId}`);

      const dial = response.dial({
        callerId,
        answerOnBridge: true, // This ensures media streams directly between clients
        timeout: 20,
      });

      dial.client(clientId);
    } else if (to.startsWith("sip:")) {
      // SIP call (if needed in the future)
      logger.info(`Dialing to SIP: ${to}`);
      const dial = response.dial({
        callerId,
        answerOnBridge: true,
      });
      dial.sip(to);
    } else {
      // Assume it's a phone number if not a client or SIP
      logger.info(`Dialing to number: ${to}`);
      const dial = response.dial({
        callerId,
        answerOnBridge: true,
        timeout: 20,
      });
      dial.number(to);
    }

    logger.debug("Generated TwiML response for voice call");
    res.type("text/xml").send(response.toString());
    return;
  } catch (error) {
    logger.error("Error generating voice response", error);
    response.say(
      {
        voice: "alice",
        language: "en-US",
      },
      "We encountered an error processing your call. Please try again later."
    );
    res.type("text/xml").send(response.toString());
  }
};

export const incomingCall = (req: Request, res: Response): void => {
  logger.info("Incoming call request received");

  const { twiml } = twilio;
  const response = new twiml.VoiceResponse();

  try {
    // Extract the intended recipient from the To parameter
    const to = req.body.To || req.query.To;

    // Extract caller information
    const from = req.body.From || req.query.From || "unknown";
    const callSid = req.body.CallSid || "unknown";

    logger.info(`Incoming call from ${from} to ${to}, CallSid: ${callSid}`);

    // Add a greeting
    response.say(
      {
        voice: "alice",
        language: "en-US",
      },
      "Incoming call to your VOIP application."
    );

    // Determine the client to connect to
    const clientId = to ? to.replace("client:", "") : "support";

    // Create a dial verb with appropriate settings
    const dial = response.dial({
      answerOnBridge: true, // Ensures media streams directly between parties
      timeout: 20, // Ring for 20 seconds before giving up
      callerId: from, // Pass the original caller ID
    });

    // Connect to the client
    dial.client(clientId);

    // If the call isn't answered or fails
    response.say(
      {
        voice: "alice",
        language: "en-US",
      },
      "The person you are trying to reach is unavailable. Please try again later."
    );

    logger.debug("Generated TwiML response for incoming call");
    res.type("text/xml").send(response.toString());
  } catch (error) {
    logger.error("Error handling incoming call", error);
    response.say(
      {
        voice: "alice",
        language: "en-US",
      },
      "We encountered an error processing your call. Please try again later."
    );
    res.type("text/xml").send(response.toString());
  }
};

// New endpoint to handle call status updates
export const callStatus = (req: Request, res: Response): void => {
  const callSid = req.body.CallSid || "unknown";
  const callStatus = req.body.CallStatus || "unknown";
  const callDuration = req.body.CallDuration || "0";

  logger.info(
    `Call status update: SID=${callSid}, Status=${callStatus}, Duration=${callDuration}s`
  );

  res.sendStatus(200);
};
