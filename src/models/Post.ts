import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";
interface Voter {
  user: mongoose.Types.ObjectId;
  vote: 1 | -1;
}
export interface IPost extends Document {
  title: string;
  content: string;
  author: IUser['_id'];
  votes: number;
  voters: Voter[];
  comments: mongoose.Types.ObjectId[];
}

const PostSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  votes: { type: Number, default: 0 },
  voters: [{
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    vote: { type: Number, enum: [1, -1], required: true }
  }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }]
}, { timestamps: true });

export default mongoose.model<IPost>("Post", PostSchema);