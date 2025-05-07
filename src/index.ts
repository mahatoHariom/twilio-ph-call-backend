import express from "express";
import cors from "cors";
import { config } from "./config";
import twilioRoutes from "./routes/twilioRoutes";

const app = express();

// Middleware
app.use(cors());
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
});

export default app;
