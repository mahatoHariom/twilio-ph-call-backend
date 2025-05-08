import { Request, Response } from "express";
import twilio from "twilio";
import { config } from "../config";

export const generateToken = (req: Request, res: Response) => {
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
      { identity }
    );
    token.addGrant(voiceGrant);

    res.json({ token: token.toJwt(), identity });
  } catch (error) {
    console.error("Error generating token", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
};

export const voiceResponse = (req: Request, res: Response) => {
  const { twiml } = twilio;
  const response = new twiml.VoiceResponse();

  const to = req.body.To || req.query.To || req.body.to;
  const from =
    req.body.From || req.query.From || req.body.from || "client:anonymous";

  if (to) {
    console.log(`Dialing to client: ${to}`);
    const dial = response.dial({ callerId: from });
    dial.client(to);
  } else {
    response.say("Thanks for calling. Please specify a valid destination.");
  }

  res.type("text/xml").send(response.toString());
};

export const incomingCall = (req: Request, res: Response) => {
  console.log("Incoming call request received with body:", req.body);

  const { twiml } = twilio;
  const response = new twiml.VoiceResponse();

  response.say("Incoming call to the VOIP application.");

  const to = req.body.To || req.query.To || "support";

  const dial = response.dial();
  dial.client(to);

  res.type("text/xml").send(response.toString());
};
