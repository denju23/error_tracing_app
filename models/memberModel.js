import mongoose from "mongoose";

const MemberSchema = new mongoose.Schema(
  {
    Project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    User_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    username: {
      type: String,
      required: [true, "Please add the user name"],
    },
    email: {
      type: String,
      required: [true, "Please add the user email address"],
    },
    role: {
      type: String,
      enum: ["Owner", "Maintainer", "Developer", "QA"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    expireAt: {
      type: Date,
      default: function () {
        const twoDaysFromNow = new Date();
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
        return twoDaysFromNow;
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.MemberSchema ||
  mongoose.model("Member", MemberSchema);
