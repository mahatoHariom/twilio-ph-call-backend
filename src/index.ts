import express from "express";
import cors from "cors";
import { config } from "./config";
import twilioRoutes from "./routes/twilioRoutes";

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      new URL(config.clientUrl).origin,
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/twilio", twilioRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start the server
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Voice URL: ${config.twilio.voiceUrl}`);
});

export default app;
