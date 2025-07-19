import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    gitUrl: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // members: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Member",
    //   },
    // ],
  },
  { timestamps: true }
);

export default mongoose.models.projectSchema ||
  mongoose.model("Project", projectSchema);
