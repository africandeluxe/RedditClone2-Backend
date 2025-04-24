import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import User from "../models/User";

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
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      console.warn("No token provided");
      res.status(401).json({ message: "Not authorized, no token" });
      return;
    }

    console.log("Token received:", token);

    const decoded = verifyToken(token);
    console.log("Token decoded:", decoded);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.warn("No user found for decoded token");
      res.status(401).json({ message: "Not authorized, user not found" });
      return;
    }

    req.user = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    console.log("Authenticated user:", req.user);
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};