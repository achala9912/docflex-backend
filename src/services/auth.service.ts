// services/auth.service.ts
import User from '../models/user.model';
import { IUserDocument } from '../interfaces/user.interface';
import { createToken } from '../utils/jwt';
import { ITokenData } from '../interfaces/token.interface';

class AuthService {
  async login(userName: string, password: string): Promise<{ user: IUserDocument; token: string }> {
    const user = await User.findOne({ userName }).select('+password') as IUserDocument;
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    if (!user.isActive) throw new Error('User account is inactive');

    const tokenData: ITokenData = {
      userId: user.userId,
      role: user.role,
    };

    const token = createToken(tokenData).token;

    // Remove password before returning
    user.password = undefined as unknown as string;

    return { user, token };
  }

  async getCurrentUser(userId: string): Promise<IUserDocument> {
    const user = await User.findOne({ userId }).populate('role') as IUserDocument;
    if (!user) throw new Error('User not found');
    return user;
  }
}

export default new AuthService();