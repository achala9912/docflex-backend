
// import express from "express";
// import { withPermissions } from "../../middlewares/role.middleware";
// import { PERMISSIONS } from "../../constants/permissions.constants";
// import userController from "../../controllers/user.controller";
// import validate from "../../middlewares/validate.middleware";
// const router = express.Router();

// // Get specific user
// router.get(
//   "/:userId",
//   ...withPermissions(PERMISSIONS.USER_READ, async (req, res) => {
//     await userController.getUserById(req, res);
//   })
// );

// // Update user
// router.put(
//   "/:userId",
//   ...withPermissions(PERMISSIONS.USER_UPDATE, async (req, res) => {
//     await userController.updateUser(req, res);
//   })
// );

// // Delete user
// router.delete(
//   "/:userId",
//   ...withPermissions(PERMISSIONS.USER_DELETE, async (req, res) => {
//     await userController.deleteUser(req, res);
//   })
// );

// export default router;
import express from "express";
import userController from "../../controllers/user.controller";
import { checkPermission } from "../../middlewares/role.middleware";
import authMiddleware from "../../middlewares/auth.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import { UserSchema, UpdateUserSchema } from "../../schemas/user.schema";
import validate from "../../middlewares/validate.middleware";

const router = express.Router();

// ✅ Add authentication middleware first
router.use(authMiddleware);

// ✅ All user routes require USER_READ permission by default
router.use(checkPermission(PERMISSIONS.USER_READ));

// ✅ Create User
router.post(
  "/",
  checkPermission(PERMISSIONS.USER_CREATE),
  validate(UserSchema),
  userController.createUser
);

// ✅ Get All Users
router.get("/", userController.getAllUsers);

// ✅ Get Single User
router.get("/:userId", userController.getUserById);

// ✅ Update User
router.put(
  "/:userId",
  checkPermission(PERMISSIONS.USER_UPDATE),
  validate(UpdateUserSchema),
  userController.updateUser
);

// ✅ Delete User
router.delete(
  "/:userId",
  checkPermission(PERMISSIONS.USER_DELETE),
  userController.deleteUser
);

export default router;
