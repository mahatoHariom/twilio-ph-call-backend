import { Request, Response } from "express";
import twilio from "twilio";
import { config } from "../config";

export const generateToken = (req: Request, res: Response) => {
  const identity = req.body.identity || "user";

  try {
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: config.twilio.appSid,
      incomingAllow: true,
    });

    const token = new AccessToken(
      config.twilio.accountSid,
      config.twilio.apiKey,
      config.twilio.apiSecret,
      { identity }
    );

    token.addGrant(voiceGrant);

    res.json({
      token: token.toJwt(),
      identity,
    });
  } catch (error) {
    console.error("Error generating token", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
};

export const voiceResponse = (req: Request, res: Response) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;

  console.log("Voice request received with body:", req.body);

  const to = req.body.To || req.query.To || req.body.to;
  const from = req.body.From || req.query.From || req.body.from;

  console.log(`Attempting to connect call - To: ${to}, From: ${from}`);

  const twiml = new VoiceResponse();

  if (to) {
    console.log(`Dialing to client: ${to}`);
    const dial = twiml.dial({
      callerId: from || "client:anonymous",
    });
    dial.client(to);
  } else {
    console.log("No destination specified, playing message");
    twiml.say("Thanks for calling. Please specify a valid destination.");
  }

  const twimlString = twiml.toString();
  console.log("Generated TwiML:", twimlString);

  res.type("text/xml");
  res.send(twimlString);
};

export const incomingCall = (req: Request, res: Response) => {
  console.log("Incoming call request received with body:", req.body);

  const VoiceResponse = twilio.twiml.VoiceResponse;
  const twiml = new VoiceResponse();

  twiml.say("Incoming call to the VOIP application.");

  const to = req.body.To || req.query.To || "support";
  console.log(`Routing incoming call to: ${to}`);

  const dial = twiml.dial();
  dial.client(to);

  const twimlString = twiml.toString();
  console.log("Generated TwiML for incoming call:", twimlString);

  res.type("text/xml");
  res.send(twimlString);
};
