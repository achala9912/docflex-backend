import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { ACTIONS } from "../constants/modification-history.constant";

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
    const createdBy = req.tokenData?.userId || "System";

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    const newUserData = {
      ...req.body,
      password: tempPassword,
      profilePicture: req.body.profilePicture || "",
      modificationHistory: [
        {
          action: ACTIONS.CREATE,
          modifiedBy: createdBy,
          date: new Date(),
        },
      ],
    };

    const newUser = await userService.createUser(newUserData);

    res.status(201).json({
      success: true,
      message: "User created successfully. Temporary password sent via email.",
      user: newUser,
    });
  } catch (error: any) {
    let errorMessage = "Internal server error";
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const value = error.keyValue[field];
      errorMessage = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } '${value}' already exists.`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error("❌ Error creating user:", errorMessage);
    res.status(400).json({ success: false, message: errorMessage });
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
    const modifiedBy = req.tokenData?.userId || "System";


    const updateData = {
      ...req.body,
      $push: {
        modificationHistory: {
          action: ACTIONS.UPDATE,
          modifiedBy,
          date: new Date(),
        },
      },
    };

    const updatedUser = await userService.updateUser(
      req.params.userId,
      updateData
    );

    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      message: "User updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Bad request";
    console.error("❌ Error updating user:", errorMessage);
    res.status(400).json({ success: false, message: errorMessage });
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
