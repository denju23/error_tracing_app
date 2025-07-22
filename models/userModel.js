import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add the user name"],
    },
    email: {
      type: String,
      required: [true, "Please add the user email address"],
      
    },
    password: {
      type: String,
      // required: [true, "Please add the user password"],
      select: false,
    },
    // isActive: {
    //   type: Boolean,
    // },
    // role: {
    //   type: String,
    //   enum: ["admin"],
    // },
    Projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        // nullable:true
      },
    ],
    isUserRegistered:{
      type:Boolean,
      default:true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
export default mongoose.models.userSchema ||
  mongoose.model("User", userSchema);