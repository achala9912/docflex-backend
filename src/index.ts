import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import errorHandler from "./utils/errorHandler";
import "./utils/cronJob";
// Import versioned routes
import v1AuthRoutes from "./routes/v1/auth.route";
import v1RoleRoutes from "./routes/v1/role.route";
import v1UserRoutes from "./routes/v1/user.route";
import v1MedicalCenterRoutes from "./routes/v1/medicalCenter.route";
import v1PatientsRoutes from "./routes/v1/patient.routes";
import v1SessionsRoutes from "./routes/v1/session.routes";
import v1GenericRoutes from "./routes/v1/generic-name.routes";
import v1AppointmentRoutes from "./routes/v1/appointment.route";
import v1ProductRoutes from "./routes/v1/product.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ API Version 1 Router
const v1Router = express.Router();
v1Router.use("/auth", v1AuthRoutes);
v1Router.use("/roles", v1RoleRoutes);
v1Router.use("/users", v1UserRoutes);
v1Router.use("/medical-centers", v1MedicalCenterRoutes);
v1Router.use("/patients", v1PatientsRoutes);
v1Router.use("/sessions", v1SessionsRoutes);
v1Router.use("/generic", v1GenericRoutes);
v1Router.use("/appointments", v1AppointmentRoutes);
v1Router.use("/products", v1ProductRoutes);

// ✅ Mount versioned router
app.use("/api/v1", v1Router);

// ✅ Legacy (non-versioned) Routes — optional
app.use("/api/auth", v1AuthRoutes);
app.use("/api/roles", v1RoleRoutes);
app.use("/api/users", v1UserRoutes);
app.use("/api/medical-centers", v1MedicalCenterRoutes);
app.use("/api/patients", v1PatientsRoutes);
app.use("/api/sessions", v1SessionsRoutes);
app.use("/api/generic", v1GenericRoutes);
app.use("/api/appointments", v1AppointmentRoutes);
app.use("/api/products", v1ProductRoutes);

// ✅ Global Error Handler (keep at bottom)
app.use(errorHandler);

// ✅ Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`API v1 endpoints available at /api/v1/`);
    console.log(`Legacy endpoints available at /api/`);
    console.log("TWILIO_PHONE_NUMBER:", process.env.TWILIO_PHONE_NUMBER);
    console.log("TWILIO_SID:", process.env.TWILIO_SID);
    console.log("TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN);
  });
});
