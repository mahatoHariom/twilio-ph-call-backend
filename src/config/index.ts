import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * Required environment variables for the application to function
 * These will be validated at startup
 */
const REQUIRED_ENV_VARS = [
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_API_KEY",
  "TWILIO_API_SECRET",
  "TWILIO_APP_SID",
] as const;

/**
 * Application configuration object
 */
export const config = {
  /**
   * Server port to listen on
   */
  port: parseInt(process.env.PORT || "9000", 10),

  /**
   * Twilio configuration settings
   */
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    apiKey: process.env.TWILIO_API_KEY || "",
    apiSecret: process.env.TWILIO_API_SECRET || "",
    appSid: process.env.TWILIO_APP_SID || "",
  },

  /**
   * Client URL for CORS configuration
   */
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};

// Validate required environment variables
const missingVars = REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar]);

if (missingVars.length > 0) {
  console.warn(
    `Warning: Missing required environment variables: ${missingVars.join(", ")}`
  );
  console.warn(
    "The application may not function correctly without these variables set."
  );
}

// Export configuration types for better type safety throughout the app
export type Config = typeof config;
export type TwilioConfig = typeof config.twilio;
