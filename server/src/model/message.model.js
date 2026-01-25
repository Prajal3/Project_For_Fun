import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: null,
    },

    message_type: {
      type: String,
      enum: "text",
      default: "text",
    },

    text: {
      type: String,
      required: true,
    },

    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },

  { timestamps: true },
);
// Add an index for fast querying by  receiver
messageSchema.index({ receiver: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
