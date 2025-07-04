import User from '../models/user.model';
import { IUserDocument } from '../interfaces/user.interface';
import { createToken } from '../utils/jwt';
import { ITokenData } from '../interfaces/token.interface';

class AuthService {
  async login(userName: string, password: string): Promise<{ user: IUserDocument; token: string }> {
    // Use type assertion with proper type
    const user = await User.findOne({ userName }).select('+password').exec() as IUserDocument | null;
    if (!user) throw new Error('Invalid credentials');

    // Now TypeScript knows user has comparePassword
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    if (!user.isActive) throw new Error('User account is inactive');

    const tokenData: ITokenData = {
      userId: user.userId,
      role: user.role.toString(), // Ensure role is string if needed
    };

    const token = createToken(tokenData).token;

    // Remove password safely
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return { user: user as IUserDocument, token };
  }

  async getCurrentUser(userId: string): Promise<IUserDocument> {
    const user = await User.findOne({ userId }).populate('role').exec() as IUserDocument | null;
    if (!user) throw new Error('User not found');
    return user;
  }
}

export default new AuthService();