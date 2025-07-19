import { errorHandler } from "../middleware/error.js";
import { asyncError } from "../middleware/catchAsyncError.js";
import { checkAuth } from "../middleware/auth.js";
import Joi from "joi";
import Error from "../models/errorModel.js";
import Project from "../models/projectModel.js";
import QABug from "../models/QABugsModel.js";

//@desc Create  QABug
//@route POST /api/project-error-qabug/new
const createQaBug = asyncError(async (req, res) => {
  try {
    const { imageUrl, comment } = req.body;
    const { Project_id, Error_id } = req.query;
    // console.log(Project_id, Error_id,'idddddddddddddddddd')
    if (!Project_id) {
      return errorHandler(res, 404, "Project_id not found");
    }

    if (!Error_id) {
      return errorHandler(res, 404, "Error_id not found");
    }

    if (!imageUrl && !comment) {
      return errorHandler(res, 400, "please enter all filed");
    }

    const ProjectId = await Project.findById(Project_id);
    if (!ProjectId) {
      return errorHandler(res, 400, "Project Does not Exist");
    }

    const ErrorId = await Error.findById(Error_id);
    if (!ErrorId) {
      return errorHandler(res, 400, "Error Does not Exist");
    }

    const QABugsValidation = Joi.object({
      imageUrl: Joi.string().trim().min(3).max(30).required().messages({
        "string.base": "imageUrl should be a type of a 'text' ",
        "string.empty": "imageUrl can not be empty field",
        "string.min": "imageUrl should have a minimum length of 3",
        "string.max": "imageUrl should have maximum length of 30",
        "any.required": "imageUrl is required field",
      }),
      comment: Joi.string().trim().min(3).required().messages({
        "string.base": "comment should be a type of a 'text' ",
        "string.empty": "comment can not be empty field",
        "string.min": "comment should have a minimum length of 3",
        "any.required": "comment is required field",
      }),
    });

    const { error } = QABugsValidation.validate({ imageUrl, comment });

    if (error) {
      return errorHandler(res, 400, error?.message);
    }
    const user = await checkAuth(req);

    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }
    const QABugsData = await QABug.create({
      Project_id: Project_id,
      Error_id: Error_id,
      imageUrl,
      comment,
      username: user.username,
      email: user.email,
    });

    res.status(201).json({
      status: true,
      StatusCode: 201,
      data: {
        message: "Post Request Processed Successfully 😍",
        result: { QABugsData, CommentLength: comment.length },
      },
    });
  } catch (error) {
    console.log(error, "error");
    errorHandler(res, 400, "Something went wrong 🤦");
  }
});

//@desc Get QA Bug
//@route GET /api/project-error-qabug
const getQaBug = asyncError(async (req, res) => {
  try {
    const { QaBug_id } = req.query;
    // console.log(QaBug_id, "QaBug_id");
    if (!QaBug_id) {
      return errorHandler(res, 404, "QaBug_id not found");
    }

    const QaBugs = await QABug.findById(QaBug_id);
    if (!QaBugs) {
      return errorHandler(res, 404, "QABug not found");
    }

    const user = await checkAuth(req);

    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }

    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: { message: "QABug Retrived Successfully", result: QaBugs },
    });
  } catch (error) {
    console.log(error, "error");
    errorHandler(res, 400, "Something went wrong 🤦");
  }
});

//@desc Get QA Bug Error Id
//@route GET /api/project-error-qabug/error
const getQaBugByErrorId = asyncError(async (req, res) => {
  try {
     const { Error_id } = req.query;

    if (!Error_id) {
      return errorHandler(res, 404, 'Error_id not found');
    }

    const qaBugs = await QABug.find({ Error_id });

    if (!qaBugs) {
      return errorHandler(res, 404, 'QA Bugs not found');
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, 'Login First');
    }

    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: {
        message: 'Error Bugs Retrieved Successfully',
        result: qaBugs,
      },
    });
;
  } catch (error) {
    console.log(error, "error");
    errorHandler(res, 400, "Something went wrong 🤦");
  }
});


//@desc Get QA Bug Project Id
//@route GET /api/project-error-qabug/project
const getQaBugByProjectId = asyncError(async (req, res) => {
  try {
    const { Project_id } = req.query;

    if (!Project_id) {
      return errorHandler(res, 404, 'Project_id not found');
    }

    const qaBugs = await QABug.find({ Project_id });

    if (!qaBugs || qaBugs.length === 0) {
      return errorHandler(res, 404, 'QA Bugs not found for this project');
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, 'Login First');
    }

    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: {
        message: 'QA Bugs Retrieved Successfully',
        result: qaBugs,
      },
    });
  } catch (error) {
    console.error(error);
    errorHandler(res, 500, 'Something went wrong');
  }
});



//@desc Update QA Bug 
//@route PUT /api/project-error-qabug/update
const updateQaBug = asyncError(async (req, res) => {
  try {
    const { QaBug_id } = req.query;

    if (!QaBug_id) {
      return errorHandler(res, 404, 'QaBug_id not found');
    }

    const { imageUrl, comment } = req.body;

    // Validate QA Bug input
    const schema = Joi.object({
      imageUrl: Joi.string().trim().min(3).max(100).required(),
      comment: Joi.string().trim().min(3).required(),
    });

    const { error: validationError } = schema.validate({ imageUrl, comment });
    if (validationError) {
      return errorHandler(res, 400, validationError.message);
    }

    // Find and update QA Bug
    const updatedQABug = await QABug.findByIdAndUpdate(
      QaBug_id,
      { imageUrl, comment },
      { new: true }
    );

    if (!updatedQABug) {
      return errorHandler(res, 404, 'QA Bug not found');
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, 'Login First');
    }

    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: {
        message: 'QA Bug Updated Successfully',
        result: updatedQABug,
      },
    });
  } catch (error) {
    console.error(error);
    errorHandler(res, 500, 'Something went wrong');
  }
})

//@desc delete QA Bug 
//@route DELETE /api/project-error-qabug/delete
const deleteQaBug = asyncError(async (req, res) => {
  try {
    const { QaBug_id } = req.query;

    if (!QaBug_id) {
      return errorHandler(res, 404, 'QaBug_id not found');
    }

    // Find and delete QA Bug
    const deletedQABug = await QABug.findByIdAndDelete(QaBug_id);

    if (!deletedQABug) {
      return errorHandler(res, 404, 'QA Bug not found');
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, 'Login First');
    }
    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: {
        message: 'QA Bug Deleted Successfully',
        // result: deletedQABug,
      },
    });
  } catch (error) {
    console.error(error);
    errorHandler(res, 500, 'Something went wrong');
  }
});




export { createQaBug, getQaBug, getQaBugByErrorId,getQaBugByProjectId,updateQaBug,deleteQaBug };
