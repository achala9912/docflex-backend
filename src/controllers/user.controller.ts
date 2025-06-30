import { Request, Response } from 'express';
import userService from '../services/user.service';

class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).send(user);
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.send(users);
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(req.params.userId);
      if (!user) return res.status(404).send({ error: 'User not found' });
      res.send(user);
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const user = await userService.updateUser(req.params.userId, req.body);
      if (!user) return res.status(404).send({ error: 'User not found' });
      res.send(user);
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      await userService.deleteUser(req.params.userId);
      res.send({ message: 'User deleted successfully' });
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }

  async checkUsernameAvailability(req: Request, res: Response) {
    try {
      const isAvailable = await userService.checkUsernameAvailability(req.params.userName);
      res.send({ isAvailable });
    } catch (error: any) {
      res.status(400).send({ error: error.message });
    }
  }
}

export default new UserController();