import express from "express";
import userController from "../../controllers/user.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import checkRole from "../../middlewares/role.middleware";

const router = express.Router();

// Protect all routes with authentication
router.use(authMiddleware);

// Only admin can manage users
router.post("/", checkRole(["manage_users"]), (req, res, next) => {
  userController.createUser(req, res).catch(next);
});

router.get("/", checkRole(["view_users"]), (req, res, next) => {
  userController.getAllUsers(req, res).catch(next);
});

router.get("/:userId", checkRole(["view_users"]), (req, res, next) => {
  userController.getUserById(req, res).catch(next);
});

router.put("/:userId", checkRole(["manage_users"]), (req, res, next) => {
  userController.updateUser(req, res).catch(next);
});

router.delete("/:userId", checkRole(["manage_users"]), (req, res, next) => {
  userController.deleteUser(req, res).catch(next);
});

router.get("/check-username/:userName", (req, res, next) => {
  userController.checkUsernameAvailability(req, res).catch(next);
});

export default router;
