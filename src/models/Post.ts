import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export interface IPost extends Document {
  title: string;
  content: string;
  author: IUser['_id'];
  votes: number;
  voters: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
}

const PostSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  votes: { type: Number, default: 0 },
  voters: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
}, { timestamps: true });

export default mongoose.model<IPost>("Post", PostSchema);