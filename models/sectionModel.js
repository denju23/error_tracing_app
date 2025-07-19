import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    Project_id:{
      type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        // required: true,
    },
    totalError: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Error",
        // index: true, 

      },
    ],
    isQaDone: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Error",
        // index: true,
      },
    ],
    isDeveloperDone: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Error",
        // index: true,
      },
    ],
    bothDone: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Error",
        // index: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.SectionSchema ||
  mongoose.model("Section", SectionSchema);
