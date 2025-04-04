import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import User from "../models/User";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    username: string;
    email: string;
  };
}

export const protect = async (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      res.status(401).json({ message: "Not authorized, no token" });
      return;
    }
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      res.status(401).json({ message: "Not authorized, user not found" });
      return;
    }
    
    req.user = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email
    };
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};