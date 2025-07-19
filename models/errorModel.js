import mongoose from "mongoose";

const ErrorSchema = new mongoose.Schema(
  {
    Project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    User_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    path: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: "System Error",
    },
    ip: {
      type: String,
    },
    browser: {
      type: String,
    },
    titleOfImage: {
      type: String,
      required: true,
    },
    descriptionOfImage: {
      type: String,
      required: true,
    },
    appVersion: {
      type: String,
      required: true,
    },
    hostName: {
      type: String,
      required: true,
    },
    protocolUrl: {
      type: String,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isChecked: {
      type: Boolean,
      default: false,
    },
    isQaDone: {
      type: Boolean,
      default: false,
    },
    isDeveloperDone: {
      type: Boolean,
      default: false,
    },
    // index: Number, 
  },
  { timestamps: true }
);

export default mongoose.models.ErrorSchema ||
  mongoose.model("Error", ErrorSchema);
