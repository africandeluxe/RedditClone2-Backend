import { Router } from "express";
import { getPosts, getPost, createPost, updatePost, deletePost, votePost } from "../controllers/posts";
import { protect } from "../middleware/auth";
import { getMyPosts } from "../controllers/posts";


const router = Router();

router.get("/", (req, res, next) => {
  getPosts(req, res).catch(next);
});

router.get("/me", protect, getMyPosts);

router.get("/my-posts", protect, getMyPosts);

router.post("/", protect, (req, res, next) => {
  createPost(req, res).catch(next);
});

router.put("/:id", protect, (req, res, next) => {
  updatePost(req, res).catch(next);
});

router.delete("/:id", protect, (req, res, next) => {
  deletePost(req, res).catch(next);
});

router.post("/:id/vote", protect, (req, res, next) => {
  votePost(req, res).catch(next);
});

router.get("/:id", (req, res, next) => {
  getPost(req, res).catch(next);
});

export default router;