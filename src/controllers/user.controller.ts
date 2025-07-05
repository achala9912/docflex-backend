import { Request, Response } from "express";
import userService from "../services/user.service";

class UserController {
  async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tokenData) {
        res.status(401).json({ error: "Unauthorized" });
        return; // ✅ exit function after sending response
      }

      const users = await userService.getAllUsers(req.query, req.tokenData);
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
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
      const user = await userService.getUserById(req.params.userId);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

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
      const updatedUser = await userService.updateUser(
        req.params.userId,
        req.body
      );

      if (!updatedUser) {
        res.status(404).json({ error: "User not found" });
        return;
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
      await userService.deleteUser(req.params.userId);
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
