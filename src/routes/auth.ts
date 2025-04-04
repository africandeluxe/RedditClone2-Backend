import { Router } from "express";
import { register, login, getMe, updateUsername } from "../controllers/auth";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/update-username", protect, updateUsername);

export default router;
