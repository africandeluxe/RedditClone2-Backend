import jwt from "jsonwebtoken";
import { IUser } from "../models/User";

interface JwtPayload {
  id: string;
}

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRE = (process.env.JWT_EXPIRE || '30d') as jwt.SignOptions['expiresIn'];

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

export const generateToken = (user: IUser): string => {
  const payload: JwtPayload = { id: user._id.toString() };
  const options: jwt.SignOptions = { expiresIn: JWT_EXPIRE };

  return jwt.sign(payload, JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
