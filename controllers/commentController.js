import { errorHandler } from "../middleware/error.js";
import { asyncError } from "../middleware/catchAsyncError.js";
import { checkAuth } from "../middleware/auth.js";
import QABug from "../models/QABugsModel.js";



//@desc add Comment Using Socket.IO
// http://localhost:4000/project-qabug-comment
const addComment = asyncError(async (req, res) => {
  try {
    const { comment } = req.body;
    const { QABug_id } = req.query;
  
    const addComment = await QABug.updateOne(
      { _id: QABug_id },
      { $push: { comment: comment } }
    );
  
    io.emit("newComment", { QABug_id, comment });

    res.status(201).json({
      status: true,
      StatusCode: 201,
      data: {
        message: "Comment Added Successfully",
      },
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

export { addComment };
