// controllers/auth.controller.ts
import { Request, Response } from 'express';
import authService from '../services/auth.service';

class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { userName, password } = req.body;
      const { user, token } = await authService.login(userName, password);
      res.send({ user, token });
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.tokenData?.userId;
      if (!userId) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
      }
      const user = await authService.getCurrentUser(userId);
      res.send(user);
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }
}

export default new AuthController();