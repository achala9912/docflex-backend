export interface ITokenData {
  userId: string;
  role: string;
}

export interface IToken {
  token: string;
  expiresIn: number;
}