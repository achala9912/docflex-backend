import express from "express";
import userController from "../../controllers/user.controller";
import { checkPermission } from "../../middlewares/role.middleware";
import authMiddleware from "../../middlewares/auth.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import { UserSchema, UpdateUserSchema } from "../../schemas/user.schema";
import validate from "../../middlewares/validate.middleware";

const router = express.Router();

router.use(authMiddleware);
router.use(checkPermission(PERMISSIONS.USER_READ));

router.post(
  "/",
  checkPermission(PERMISSIONS.USER_CREATE),
  validate(UserSchema),
  userController.createUser
);

router.get("/", userController.getAllUsers);
router.get("/:userId", userController.getUserById);

router.put(
  "/:userId",
  checkPermission(PERMISSIONS.USER_UPDATE),
  validate(UpdateUserSchema),
  userController.updateUser
);

router.delete(
  "/:userId",
  checkPermission(PERMISSIONS.USER_DELETE),
  userController.deleteUser
);

export default router;
