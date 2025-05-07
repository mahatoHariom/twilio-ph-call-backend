import express from "express";
import cors from "cors";
import { config } from "./config";
import twilioRoutes from "./routes/twilioRoutes";
import logger from "./utils/logger";

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", new URL(config.clientUrl).origin],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/twilio", twilioRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
  logger.info(`Twilio Voice URL: ${config.twilio.voiceUrl}`);

  if (process.env.NODE_ENV === "development") {
    logger.debug(`Health check: http://localhost:${config.port}/health`);
  }
});

export default app;
