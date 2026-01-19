import mongoose, { Document, Schema } from "mongoose";

export interface IChat extends Document {
  chatName: string;
  isGroupChat: boolean;
  users: mongoose.Schema.Types.ObjectId[];
  latestMessage?: mongoose.Schema.Types.ObjectId;
  groupAdmin?: mongoose.Schema.Types.ObjectId;
}

const chatSchema = new Schema<IChat>(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Links to the User model we made earlier
      },
    ],
    // Optimization: We store the latest message directly on the Chat object
    // so we can display it on the dashboard without fetching all 10,000 messages.
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model<IChat>("Chat", chatSchema);
export default Chat;