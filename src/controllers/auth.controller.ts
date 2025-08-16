import { Request, Response } from "express";
import authService from "../services/auth.service";
import * as roleService from "../services/role.service";
import { Permission } from "../constants/permissions.constants";

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
  token?: string;
  permissions?: Permission[];
}

// class AuthController {
//   async login(req: Request, res: Response): Promise<Response<AuthResponse>> {
//     try {
//       const { userName, password } = req.body;
//       const { user, token } = await authService.login(userName, password);

//       const permissions = await roleService.getRolePermissions(
//         user.role.toString()
//       );

//       return res.json({
//         success: true,
//         user,
//         token,
//       });
//     } catch (error: any) {
//       return res.status(400).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

//   async getCurrentUser(
//     req: Request,
//     res: Response
//   ): Promise<Response<AuthResponse>> {
//     try {
//       const userId = req.tokenData?.userId;
//       if (!userId) {
//         return res.status(400).json({
//           success: false,
//           message: "User ID is missing from token data",
//         });
//       }
//       const user = await authService.getCurrentUser(userId);
//       const permissions = await roleService.getRolePermissions(
//         user.role.toString()
//       );

//       return res.json({
//         success: true,
//         user,
//         permissions,
//       });
//     } catch (error: any) {
//       return res.status(400).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   }

class AuthController {
  async login(req: Request, res: Response): Promise<Response<AuthResponse>> {
    try {
      const { userName, password } = req.body;
      const { user, token } = await authService.login(userName, password);

      // --- Updated: Robust extraction of role identifier ---
      let roleIdentifier;
      if (user.role && typeof user.role === "object" && user.role._id) {
        roleIdentifier = user.role._id.toString();
      } else {
        roleIdentifier = user.role?.toString();
      }
      const permissions = await roleService.getRolePermissions(roleIdentifier);

      return res.json({
        success: true,
        user,
        token,
        permissions,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getCurrentUser(
    req: Request,
    res: Response
  ): Promise<Response<AuthResponse>> {
    try {
      const userId = req.tokenData?.userId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "User ID is missing from token data",
        });
      }
      const user = await authService.getCurrentUser(userId);

      // --- Updated: Robust extraction of role identifier ---
      let roleIdentifier;
      if (user.role && typeof user.role === "object" && user.role) {
        roleIdentifier = user.role._id.toString();
      } else {
        roleIdentifier = user.role;
      }
      const permissions = await roleService.getRolePermissions(roleIdentifier);

      return res.json({
        success: true,
        user,
        permissions,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  async changePassword(req: Request, res: Response) {
    try {
      const { userName, oldPassword, newPassword } = req.body;
      await authService.changePassword(userName, oldPassword, newPassword);
      return res.json({ success: true, message: "Password changed." });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async sendForgotPasswordOtp(req: Request, res: Response) {
    try {
      const { userName } = req.body;
      await authService.sendForgotPasswordOtp(userName);
      return res.json({ success: true, message: "OTP sent to email." });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  async verifyOtpAndResetPassword(req: Request, res: Response) {
    try {
      const { userName, otp, newPassword } = req.body;
      await authService.verifyOtpAndResetPassword(userName, otp, newPassword);
      return res.json({ success: true, message: "Password reset successful." });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

export default new AuthController();
