import { ITokenData } from '../../interfaces/token.interface';

declare global {
  namespace Express {
    interface Request {
      tokenData?: ITokenData;
    }
  }
}