import { Request, Response } from "express";
import User from "../models/User";
import { generateToken, generateRefreshToken, verifyToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middleware/auth";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;
    const userExists = await User.findOne({ $or: [{ username }, { email }] });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user = await User.create({ username, email, password });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user),
      refreshToken: generateRefreshToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && await user.comparePassword(password)) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user),
        refreshToken: generateRefreshToken(user)
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUsername = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.username = req.body.username || user.username;
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const newAccessToken = generateToken(user);
    res.json({ token: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};