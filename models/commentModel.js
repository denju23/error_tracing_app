import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    QABug_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QABug",
      required: true,
    },

    comments: 
      {
        text: {
          type: String,
          // required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        replies: [
          {
            text: {
              type: String,
              required: false,
            },
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
          },
        ], 
      },
    
    // isDeleted: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  { timestamps: true }
);

export default mongoose.models.CommentSchema ||
  mongoose.model("QABugComment", CommentSchema);
