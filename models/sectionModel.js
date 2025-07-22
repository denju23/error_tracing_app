import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    Project_id:{
      type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    totalError: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Error",
      },
    ],
    isQaDone: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Error",
      },
    ],
    isDeveloperDone: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Error",
      },
    ],
    bothDone: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Error",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.SectionSchema ||
  mongoose.model("Section", SectionSchema);
