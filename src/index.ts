import express from "express";
import cors from "cors";
import { config } from "./config";
import twilioRoutes from "./routes/twilioRoutes";
import reservationRoutes from "./routes/reservationRoutes";
import logger from "./utils/logger";

const app = express();

// Configure CORS with more detailed options
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/twilio", twilioRoutes);
app.use("/api/reservations", reservationRoutes);

app.get("/health", (_, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);

  if (process.env.NODE_ENV === "development") {
    logger.debug(`Health check: http://localhost:${config.port}/health`);
    logger.debug(`API endpoints: 
    - Twilio: http://localhost:${config.port}/api/twilio
    - Reservations: http://localhost:${config.port}/api/reservations`);
    logger.debug(
      `CORS allowed origins: ${[config.clientUrl, "http://localhost:5173"].join(
        ", "
      )}`
    );
  }
});

export default app;
