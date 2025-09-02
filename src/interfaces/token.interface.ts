import { Types } from "mongoose";
export interface ITokenData {
  userId: string;
  role: string;
  centerId?: Types.ObjectId | string;
}

export interface IToken {
  token: string;
  expiresIn: number;
}