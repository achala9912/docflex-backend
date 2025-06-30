import User from '../models/user.model';
import Role from '../models/role.model';
import { IUser, IUserInput } from '../interfaces/user.interface';

class UserService {
  async createUser(userData: IUserInput): Promise<IUser> {
    // Check if role exists
    const roleExists = await Role.findOne({ roleId: userData.role });
    if (!roleExists) throw new Error('Role not found');

    // Generate userId if not provided
    const lastUser = await User.findOne().sort({ userId: -1 }).limit(1);
    const lastId = lastUser ? parseInt(lastUser.userId.substring(1)) : 0;
    const userId = `E${(lastId + 1).toString().padStart(4, '0')}`;

    const user = new User({ ...userData, userId });
    return await user.save();
  }

  async getAllUsers(): Promise<IUser[]> {
    return await User.find().populate('role');
  }

  async getUserById(userId: string): Promise<IUser | null> {
    return await User.findOne({ userId }).populate('role');
  }

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    if (updateData.role) {
      const roleExists = await Role.findOne({ roleId: updateData.role });
      if (!roleExists) throw new Error('Role not found');
    }

    return await User.findOneAndUpdate({ userId }, updateData, { new: true }).populate('role');
  }

  async deleteUser(userId: string): Promise<void> {
    await User.findOneAndDelete({ userId });
  }

  async checkUsernameAvailability(userName: string): Promise<boolean> {
    const user = await User.findOne({ userName });
    return !user;
  }
}

export default new UserService();