import { Router } from "express";
import { createComment, deleteComment, voteComment } from "../controllers/comments";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/:postId", protect, (req, res, next) => {
  createComment(req, res).catch(next);
});

router.delete("/:id", protect, (req, res, next) => {
  deleteComment(req, res).catch(next);
});

router.post("/:id/vote", protect, (req, res, next) => {
  voteComment(req, res).catch(next);
});

export default router;