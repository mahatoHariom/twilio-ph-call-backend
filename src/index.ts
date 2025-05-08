import express from "express";
import cors from "cors";
import { config } from "./config";
import twilioRoutes from "./routes/twilioRoutes";
import logger from "./utils/logger";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/twilio", twilioRoutes);

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
  }
});

export default app;
