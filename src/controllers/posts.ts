import { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import { AuthenticatedRequest } from "../middleware/auth";

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await Post.find()
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username profilePicture")
      .populate({
        path: "comments",
        populate: { path: "author", select: "username profilePicture" }
      });
      
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    const author = req.user?._id;
    
    if (!author) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const post = await Post.create({ 
      title, 
      content, 
      author: new mongoose.Types.ObjectId(author) 
    });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    
    if (!req.user || post.author.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    
    post.title = title || post.title;
    post.content = content || post.content;
    
    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    
    if (!req.user || post.author.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    
    await Post.deleteOne({ _id: post._id });
    res.json({ message: "Post removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const votePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const postId = req.params.id;
    const { vote } = req.body;
    
    if (!userId) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const post = await Post.findById(postId);
    
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }
    
    const userIdObj = new mongoose.Types.ObjectId(userId);

    const hasVoted = post.voters.some(voter => voter.equals(userIdObj));

    if (hasVoted) {
      post.voters = post.voters.filter(voter => !voter.equals(userIdObj));
    }
      if (vote === 1) {
        post.votes += 1;
        post.voters.push(userIdObj);
      } else if (vote === -1) {
        post.votes -= 1;
        post.voters.push(userIdObj);
    } else {
      res.status(400).json({ message: "Invalid vote" });
      return;
    }
    
    await post.save();
    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    console.log("Getting posts for user:", userId);

    if (!userId) {
      console.warn("No user ID on request");
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const posts = await Post.find({ author: userId })
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 });

    console.log(`Found ${posts.length} post(s) for user ${userId}`);
    res.json(posts);
  } catch (error) {
    console.error("getMyPosts error:", error);
    res.status(500).json({ message: "Server error" });
  }
};