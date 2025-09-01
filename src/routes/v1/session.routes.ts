import express from "express";
import * as sessionController from "../../controllers/session.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import { checkPermission } from "../../middlewares/role.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import {
  SessionSchema,
  UpdateSessionSchema,
} from "../../schemas/session.schema";
import validate from "../../middlewares/validate.middleware";

const router = express.Router();

router.use(authMiddleware);

router.post(
  "/",
  checkPermission(PERMISSIONS.SESSION_MANAGEMENT),
  validate(SessionSchema),
  sessionController.createSession
);

router.get(
  "/",
  checkPermission(PERMISSIONS.SESSION_MANAGEMENT),
  sessionController.getAllSessions
);
router.get(
  "/constants",
  sessionController.getSessionSuggestions
);

router.get(
  "/:sessionId",
  checkPermission(PERMISSIONS.SESSION_MANAGEMENT),
  sessionController.getSession
);

router.put(
  "/:sessionId",
  checkPermission(PERMISSIONS.SESSION_MANAGEMENT),
  validate(UpdateSessionSchema),
  sessionController.updateSession
);

router.patch(
  "/active/:sessionId",
  checkPermission(PERMISSIONS.SESSION_MANAGEMENT),
  sessionController.toggleSessionActive
);

router.delete(
  "/:sessionId",
  checkPermission(PERMISSIONS.SESSION_MANAGEMENT),
  sessionController.deleteSession
);

export default router;
