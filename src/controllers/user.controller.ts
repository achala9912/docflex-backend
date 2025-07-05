import { Request, Response } from "express";
import userService from "../services/user.service";

class UserController {
  getAllUsers(arg0: string, getAllUsers: any) {
    throw new Error("Method not implemented.");
  }
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const newUser = await userService.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";
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
      res.status(500).json({ error: errorMessage });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const updatedUser = await userService.updateUser(
        req.params.userId,
        req.body
      );
      res.json(updatedUser);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Bad request";
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
      res.status(500).json({ error: errorMessage });
    }
  }
}

export default new UserController();
