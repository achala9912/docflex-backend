import express from "express";
import * as appointmentController from "../../controllers/appointment.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import { checkPermission } from "../../middlewares/role.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import {
  AppointmentSchema,
  UpdateAppointmentSchema,
} from "../../schemas/appointment.schema";
import validate from "../../middlewares/validate.middleware";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create appointment
router.post(
  "/",
  checkPermission(PERMISSIONS.APPOINTMENT_MANAGEMENT),
  validate(AppointmentSchema),
  appointmentController.createAppointmentHandler
);

// Get single appointment
router.get(
  "/:id",
  checkPermission(PERMISSIONS.APPOINTMENT_MANAGEMENT),
  appointmentController.getAppointmentHandler
);

// Get all appointments (with pagination and filters)
router.get(
  "/",
  checkPermission(PERMISSIONS.APPOINTMENT_MANAGEMENT),
  appointmentController.getAllAppointmentsHandler
);

// Get appointments for specific session
router.get(
  "/session/:sessionId",
  checkPermission(PERMISSIONS.APPOINTMENT_MANAGEMENT),
  appointmentController.getSessionAppointmentsHandler
);

// Get active session appointments for a center
router.get(
  "/center/:centerId/active",
  checkPermission(PERMISSIONS.APPOINTMENT_MANAGEMENT),
  appointmentController.getActiveSessionAppointmentsHandler
);

// Cancel appointment
router.patch(
  "/:id/cancel",
  checkPermission(PERMISSIONS.APPOINTMENT_MANAGEMENT),
  appointmentController.cancelAppointmentHandler
);

// Update appointment status
router.patch(
  "/:id/status",
  checkPermission(PERMISSIONS.APPOINTMENT_MANAGEMENT),
  validate(UpdateAppointmentSchema),
  appointmentController.updateAppointmentStatusHandler
);

// Mark appointment as visited
router.patch(
  "/:id/visit",
  checkPermission(PERMISSIONS.APPOINTMENT_MANAGEMENT),
  appointmentController.markAsVisitedHandler
);

export default router;
