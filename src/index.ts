import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import errorHandler from "./utils/errorHandler";

// Import versioned routes

import v1AuthRoutes from "./routes/v1/auth.route";
import v1RoleRoutes from "./routes/v1/role.route";
import v1UserRoutes from "./routes/v1/user.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Version 1 Routes
const v1Router = express.Router();
v1Router.use("/auth", v1AuthRoutes);
v1Router.use("/roles", v1RoleRoutes);
v1Router.use("/users", v1UserRoutes);


// Mount versioned router
app.use("/api/v1", v1Router);

// Legacy Routes (without versioning - optional for backward compatibility)
app.use("/api/auth", v1AuthRoutes);
app.use("/api/roles", v1RoleRoutes);
app.use("/api/users", v1UserRoutes);


// Error handler (should come after all routes)
app.use(errorHandler);

// Start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`API v1 endpoints available at /api/v1/`);
    console.log(`Legacy endpoints available at /api/`);
  });
});