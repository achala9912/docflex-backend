// import express from "express";
// import userController from "../../controllers/user.controller";
// import authMiddleware from "../../middlewares/auth.middleware";
// import checkRole from "../../middlewares/role.middleware";

// const router = express.Router();

// // Protect all routes with authentication
// router.use(authMiddleware);

// // Only admin can manage users
// router.post("/", checkRole(["manage_users"]), (req, res, next) => {
//   userController.createUser(req, res).catch(next);
// });

// router.get("/", checkRole(["view_users"]), (req, res, next) => {
//   userController.getAllUsers(req, res).catch(next);
// });

// router.get("/:userId", checkRole(["view_users"]), (req, res, next) => {
//   userController.getUserById(req, res).catch(next);
// });

// router.put("/:userId", checkRole(["manage_users"]), (req, res, next) => {
//   userController.updateUser(req, res).catch(next);
// });

// router.delete("/:userId", checkRole(["manage_users"]), (req, res, next) => {
//   userController.deleteUser(req, res).catch(next);
// });

// router.get("/check-username/:userName", (req, res, next) => {
//   userController.checkUsernameAvailability(req, res).catch(next);
// });

// export default router;
import express from "express";
import { withPermissions } from "../../middlewares/role.middleware";
import { PERMISSIONS } from "../../constants/permissions.constants";
import userController from "../../controllers/user.controller";

const router = express.Router();

// Get specific user
router.get(
  "/:userId",
  ...withPermissions(PERMISSIONS.USER_READ, async (req, res) => {
    await userController.getUserById(req, res);
  })
);

// Update user
router.put(
  "/:userId",
  ...withPermissions(PERMISSIONS.USER_UPDATE, async (req, res) => {
    await userController.updateUser(req, res);
  })
);

// Delete user
router.delete(
  "/:userId",
  ...withPermissions(PERMISSIONS.USER_DELETE, async (req, res) => {
    await userController.deleteUser(req, res);
  })
);

export default router;
