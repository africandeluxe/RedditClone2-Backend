import express, { Request, Response, Express } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import User from "../models/User";

const router = express.Router();

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post(
  "/profile-picture",
  upload.single("profilePicture"),
  async (req: MulterRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }

      const userId = req.body.userId;
      const filePath = `/uploads/${req.file.filename}`;

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      user.profilePicture = filePath;
      await user.save();

      res.json({ message: "Profile picture updated", profilePicture: filePath });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error uploading profile picture" });
    }
  }
);

export default router;