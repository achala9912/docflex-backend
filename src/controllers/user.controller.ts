import { Request, Response } from "express";
import * as userService from "../services/user.service";

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.tokenData) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const users = await userService.getAllUsers(req.query, req.tokenData);
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({
      error: "Server error",
      details: error instanceof Error ? error.message : undefined,
    });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
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
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
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
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    const errorMessage = error instanceof Error ? error.message : "Bad request";
    console.error("❌ Error updating user:", errorMessage);
    res.status(400).json({ error: errorMessage });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedUser = await userService.deleteUser(req.params.userId);
    if (!deletedUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json(deletedUser);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    console.error("❌ Error deleting user:", errorMessage);
    res.status(500).json({ error: errorMessage });
  }
};

export const getAllUsersSuggestion = async (req: Request, res: Response) => {
  try {
    const users = await userService.getUsersForSuggestion(req.query);
    res.status(200).json(users);
  } catch (error: any) {
    console.error("Error retrieving users:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};
