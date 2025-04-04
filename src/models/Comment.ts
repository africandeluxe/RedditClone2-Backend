import mongoose, { Document, Schema, Types } from "mongoose";
import { IUser } from "./User";
import { IPost } from "./Post";

export interface IComment extends Document {
  content: string;
  author: Types.ObjectId | IUser;
  post: Types.ObjectId | IPost;
  votes: number;
  voters: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPopulatedComment extends Omit<IComment, 'author' | 'post'> {
  author: { 
    _id: Types.ObjectId;
    username?: string;
  };
  post: { 
    _id: Types.ObjectId;
    author: Types.ObjectId;
  };
}

const CommentSchema: Schema = new Schema({
  content: { 
    type: String, 
    required: true,
    trim: true,
    minlength: [1, "Comment must be at least 1 character long"],
    maxlength: [10000, "Comment cannot exceed 10000 characters"]
  },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  votes: { type: Number, default: 0 },
  voters: [{ type: Schema.Types.ObjectId, ref: "User" }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model<IComment>("Comment", CommentSchema);