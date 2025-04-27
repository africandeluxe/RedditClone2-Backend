import { Request, Response } from "express";
import mongoose from "mongoose";
import Post from "../models/Post";
import Comment, { IComment, IPopulatedComment } from "../models/Comment";
import { AuthenticatedRequest } from "../middleware/auth";

export const createComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    const { postId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      res.status(400).json({ message: "Valid comment content is required" });
      return;
    }

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const comment = new Comment({
      content: content.trim(),
      author: req.user._id,
      post: postId,
      votes: 0,
      voters: []
    });

    const savedComment = await comment.save();
    post.comments.push(savedComment._id as mongoose.Types.ObjectId);
    await post.save();

    const populatedComment = await Comment.findById(savedComment._id)
      .populate("author", "username")
      .lean()
      .exec();

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate<{ author: { _id: mongoose.Types.ObjectId } }>("author", "_id")
      .populate<{ post: { _id: mongoose.Types.ObjectId; author: mongoose.Types.ObjectId } }>("post", "_id author")
      .orFail()
      .exec() as unknown as IPopulatedComment;
    
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const isAuthor = comment.author._id.equals(req.user._id);
    const isPostAuthor = comment.post.author.equals(req.user._id);
    
    if (!isAuthor && !isPostAuthor) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    
    await Post.updateOne(
      { _id: comment.post._id },
      { $pull: { comments: comment._id } }
    );
    
    await Comment.deleteOne({ _id: comment._id });
    res.json({ message: "Comment removed successfully" });
  } catch (error) {
    console.error(error);
    if (error instanceof mongoose.Error.DocumentNotFoundError) {
      res.status(404).json({ message: "Comment not found" });
    } else if (error instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: "Invalid comment ID" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
};

export const voteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { vote } = req.body;
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const hasVoted = comment.voters.some(voter => voter.equals(userIdObj));

    if (hasVoted) {
      comment.voters = comment.voters.filter(voter => !voter.equals(userIdObj));
      if (vote === 1) {
        comment.votes -= 1;
      } else if (vote === -1) {
        comment.votes += 1;
      }
    }

    if (vote === 1) {
      comment.votes += 1;
      comment.voters.push(userIdObj);
    } else if (vote === -1) {
      comment.votes -= 1;
      comment.voters.push(userIdObj);
    } else {
      res.status(400).json({ message: "Invalid vote" });
      return;
    }

    await comment.save();
    const updatedComment = await Comment.findById(id)
      .populate('author', 'username profilePicture');

    res.json(updatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};