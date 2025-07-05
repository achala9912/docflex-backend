import User from "../models/user.model";
import { IUserDocument } from "../interfaces/user.interface";
import { createToken } from "../utils/jwt";
import { ITokenData } from "../interfaces/token.interface";

class AuthService {
  async login(
    userName: string,
    password: string
  ): Promise<{ user: IUserDocument; token: string }> {
    console.log(`🔐 Attempting login for userName: ${userName}`);

    const user = (await User.findOne({ userName })
      .select("+password")
      .exec()) as IUserDocument | null;
    if (!user) {
      console.warn(`❌ User not found for userName: ${userName}`);
      throw new Error("Invalid credentials");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn(`❌ Password mismatch for userName: ${userName}`);
      throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
      console.warn(`🚫 Inactive account login attempt: ${userName}`);
      throw new Error("User account is inactive");
    }

    // ✅ Populate role
    await user.populate("role");
    const role = user.role as unknown as { roleId: string };

    const tokenData: ITokenData = {
      userId: user.userId,
      role: role.roleId,
    };

    const token = createToken(tokenData).token;

    console.log(`✅ Login successful for userId: ${user.userId}`);

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    return { user: user as IUserDocument, token };
  }

  async getCurrentUser(userId: string): Promise<IUserDocument> {
    console.log(`👤 Fetching current user with userId: ${userId}`);
    const user = (await User.findOne({ userId })
      .populate("role")
      .exec()) as IUserDocument | null;
    if (!user) {
      console.warn(`❌ User not found with userId: ${userId}`);
      throw new Error("User not found");
    }

    console.log(`✅ Found user: ${user.name} (${user.userName})`);
    return user;
  }
}

export default new AuthService();
