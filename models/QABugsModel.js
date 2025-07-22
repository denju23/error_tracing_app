import mongoose from "mongoose";

const QABugsSchema = new mongoose.Schema(
  {
    Project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    Error_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Error",
      required: true,
    },
    // imageUrl: {
    //   type: String,
    //   required: true,
    // },
    comment: 
      {
        type: String,
        // required: true,
      },
      QABug_img: {
        public_id: {
          type: String,
          // require: true,
        },
        url: {
          type: String,
          // require: true,
        },
      },
      name: {
        type: String,
        // required: true,
      },
      email: {
        type: String,
        // required: true,
      },
  },
  { timestamps: true }
);

export default mongoose.models.QABugsSchema ||
  mongoose.model("QABug", QABugsSchema);
