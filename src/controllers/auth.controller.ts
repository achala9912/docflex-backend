import { Request, Response } from 'express';
import authService from '../services/auth.service';
import roleService from '../services/role.service';
import { Permission } from '../constants/permissions.constants';

interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
  token?: string;
  permissions?: Permission[];
}

class AuthController {
  async login(req: Request, res: Response): Promise<Response<AuthResponse>> {
    try {
      const { userName, password } = req.body;
      const { user, token } = await authService.login(userName, password);
      
      const permissions = await roleService.getRolePermissions(user.role.toString());
      
      return res.json({
        success: true,
        user,
        token,
        permissions
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<Response<AuthResponse>> {
    try {
      const userId = req.tokenData?.userId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User ID is missing from token data'
        });
      }
      const user = await authService.getCurrentUser(userId);
      const permissions = await roleService.getRolePermissions(user.role.toString());
      
      return res.json({
        success: true,
        user,
        permissions
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export default new AuthController();