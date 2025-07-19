import mongoose from "mongoose";

const projectSecretSchema = new mongoose.Schema({
  User_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  Project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  access_key: {
    type: String,
  },
  secret_key: {
    type: String,
  },
});

export default mongoose.models.projectSecretSchema ||
  mongoose.model("projectSecret", projectSecretSchema);
