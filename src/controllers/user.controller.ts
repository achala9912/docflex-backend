import { Request, Response } from "express";
import userService from "../services/user.service";

class UserController {
  // async getAllUsers(req: Request, res: Response): Promise<void> {
  //   try {
  //     console.log("📥 Received request to fetch all users");

  //     const users = await userService.getAllUsers();

  //     console.log(`✅ Fetched ${users.length} users`);
  //     res.json(users);
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : "Internal server error";

  //     console.error("❌ Error fetching users:", errorMessage);
  //     res.status(500).json({ error: errorMessage });
  //   }
  // }
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers(req.query);
      res.status(200).json(users);
    } catch (error) {
      console.error("❌ Failed to fetch users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      console.log("📥 Received request to create user:", req.body);

      const newUser = await userService.createUser(req.body);

      console.log(`✅ User created successfully: ${newUser.userId}`);
      res.status(201).json(newUser);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      console.error("❌ Error creating user:", errorMessage);
      res.status(400).json({ error: errorMessage });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      console.log(`🔍 Received request to fetch user: ${req.params.userId}`);

      const user = await userService.getUserById(req.params.userId);

      if (!user) {
        console.warn(`⚠️ User not found: ${req.params.userId}`);
        res.status(404).json({ error: "User not found" });
        return;
      }

      console.log(`✅ User found: ${user.userName}`);
      res.json(user);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      console.error("❌ Error fetching user:", errorMessage);
      res.status(500).json({ error: errorMessage });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      console.log(`✏️ Received request to update user: ${req.params.userId}`);
      console.log("📝 Update payload:", req.body);

      const updatedUser = await userService.updateUser(
        req.params.userId,
        req.body
      );

      if (updatedUser) {
        console.log(`✅ User updated: ${updatedUser.userId}`);
      } else {
        console.warn(`⚠️ User not found for update: ${req.params.userId}`);
      }

      res.json(updatedUser);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Bad request";

      console.error("❌ Error updating user:", errorMessage);
      res.status(400).json({ error: errorMessage });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      console.log(`🗑️ Received request to delete user: ${req.params.userId}`);

      await userService.deleteUser(req.params.userId);

      console.log(`✅ User deleted: ${req.params.userId}`);
      res.status(204).send();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      console.error("❌ Error deleting user:", errorMessage);
      res.status(500).json({ error: errorMessage });
    }
  }
}

export default new UserController();
