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
  // For phone calls, use the verified caller ID from your Twilio account
  const isClientFrom = from.startsWith("client:");
  const callerId = isClientFrom ? config.twilio.callerId || from : from;

  logger.info(`Voice request: To=${to}, From=${from}, CallerId=${callerId}`);

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
      // Regular phone number call
      // For phone numbers: validate against an international phone number regex
      // This regex matches international phone numbers (e.g., +1234567890)
      const isPhoneNumber = /^\+?[1-9]\d{1,14}$/.test(to);

      logger.info(
        `Dialing to ${
          isPhoneNumber ? "phone number" : "client identity"
        }: ${to}`
      );

      // For phone numbers, make sure we have a valid caller ID
      if (
        isPhoneNumber &&
        (!config.twilio.callerId || config.twilio.callerId === "")
      ) {
        logger.warn(
          "Attempting to call a phone number without a valid callerId configured"
        );
      }

      const dial = response.dial({
        callerId: isPhoneNumber ? config.twilio.callerId || callerId : callerId, // For phone calls, always use verified number
        answerOnBridge: true,
        timeout: 20,
      });

      if (isPhoneNumber) {
        // Regular phone number call
        logger.info(
          `Making outbound call to phone number: ${to} with caller ID: ${
            config.twilio.callerId || callerId
          }`
        );

        dial.number(
          {
            // Optional parameters for better call quality and tracking
            statusCallbackEvent: [
              "initiated",
              "ringing",
              "answered",
              "completed",
            ],
            statusCallback: `${config.serverUrl}/status`,
            statusCallbackMethod: "POST",
          },
          to
        );
      } else {
        // Assume it's a client identifier without the "client:" prefix
        logger.info(`Making call to client: ${to}`);
        dial.client(to);
      }
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

    // For demo purposes, we'll simply forward the call to the client
    const dial = response.dial({
      callerId: from,
      answerOnBridge: true,
    });

    if (to && to.startsWith("client:")) {
      // If there's a specific client, call them
      const clientId = to.replace("client:", "");
      dial.client(clientId);
      logger.info(`Routing incoming call to client: ${clientId}`);
    } else {
      // If no specific client, you could route to a default client or handle differently
      // Example: dial.client("default-support-client");
      response.say(
        {
          voice: "alice",
          language: "en-US",
        },
        "Thank you for calling. No one is available right now. Please try again later."
      );
      logger.info(`No specific client to route to, playing message`);
    }

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

export const callStatus = (req: Request, res: Response): void => {
  const callSid = req.body.CallSid;
  const callStatus = req.body.CallStatus;

  logger.info(`Call status update for ${callSid}: ${callStatus}`);

  // You can implement specific handling for different call statuses here
  // For example, logging to a database, triggering notifications, etc.

  // Send an empty response to acknowledge receipt
  res.sendStatus(200);
};
