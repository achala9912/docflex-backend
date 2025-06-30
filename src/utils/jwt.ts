import jwt from 'jsonwebtoken';
import { IToken, ITokenData } from '../interfaces/token.interface';
import dotenv from 'dotenv';

dotenv.config();

const createToken = (data: ITokenData): IToken => {
  const expiresIn = 60 * 60 * 24; // 24 hours
  const secret = process.env.JWT_SECRET as string;

  return {
    token: jwt.sign(data, secret, { expiresIn }),
    expiresIn,
  };
};

const verifyToken = (token: string): ITokenData => {
  const secret = process.env.JWT_SECRET as string;
  return jwt.verify(token, secret) as ITokenData;
};

export { createToken, verifyToken };