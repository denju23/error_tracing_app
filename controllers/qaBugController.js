import { errorHandler } from "../middleware/error.js";
import { asyncError } from "../middleware/catchAsyncError.js";
import { checkAuth } from "../middleware/auth.js";
import Joi from "joi";
import Error from "../models/errorModel.js";
import Project from "../models/projectModel.js";
import QABug from "../models/QABugsModel.js";
// import { v2 as cloudinary } from 'cloudinary'
import Cloudinary from "cloudinary";
var cloudinary = Cloudinary.v2;
import fs from 'fs'

cloudinary.config({
  cloud_name:process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

//@desc Create  QABug
//@route POST /api/project-error-qabug/new
const createQaBug = asyncError(async (req, res) => {
  console.log("qa post .........");
  try {
    let QABug_image;
    console.log(req.text, "bbb");
    const file = await req?.files?.QABug_img;
    console.log(file);

    // if (!file) {
    //   return errorHandler(res, 400, "No file uploaded");
    // }
    QABug_image = await cloudinary?.uploader?.upload(file?.tempFilePath, {
      public_id: `${Date.now()}`,
      resource_type: "auto",
    });

    // Delete the local/temporary file after a timeout
    setTimeout(() => {
      fs.unlink(file.tempFilePath, (err) => {
        if (err) {
          console.error(`Error deleting file: ${err}`);
        } else {
          console.log("TempFile deleted successfully");
        }
      });
    }, 5000);

    console.log(QABug_image);
    console.log(
      QABug_image?.url,
      QABug_image?.public_id,
      "QABug_image url and public_id"
    );
    const {comment } = req.body;
    const { Project_id, Error_id } = req.query;
    if (!Project_id) {
      return errorHandler(res, 404, "Project_id not found");
    }

    if (!Error_id) {
      return errorHandler(res, 404, "Error_id not found");
    }

    if (!comment) {
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
      comment: Joi.string().trim().min(3).required().messages({
        "string.base": "comment should be a type of a 'text' ",
        "string.empty": "comment can not be empty field",
        "string.min": "comment should have a minimum length of 3",
        "any.required": "comment is required field",
      }),
    });

    const { error } = QABugsValidation.validate({ comment });

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
      comment,
      QABug_img: {
        public_id: QABug_image.public_id,
        url: QABug_image.url,
      },
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
    return errorHandler(res, 500, `${error.message}`);
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
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc Get QA Bug Error Id
//@route GET /api/project-error-qabug/error
const getQaBugByErrorId = asyncError(async (req, res) => {
  try {
    const { Error_id } = req.query;

    if (!Error_id) {
      return errorHandler(res, 404, "Error_id not found");
    }

    const qaBugs = await QABug.find({ Error_id });

    if (!qaBugs) {
      return errorHandler(res, 404, "QA Bugs not found");
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First");
    }

    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: {
        message: "Error Bugs Retrieved Successfully",
        result: qaBugs,
      },
    });
  } catch (error) {
    console.log(error, "error");
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc Get QA Bug Project Id
//@route GET /api/project-error-qabug/project
const getQaBugByProjectId = asyncError(async (req, res) => {
  try {
    const { Project_id } = req.query;

    if (!Project_id) {
      return errorHandler(res, 404, "Project_id not found");
    }

    const qaBugs = await QABug.find({ Project_id });

    if (!qaBugs || qaBugs.length === 0) {
      return errorHandler(res, 404, "QA Bugs not found for this project");
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First");
    }

    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: {
        message: "QA Bugs Retrieved Successfully",
        result: qaBugs,
      },
    });
  } catch (error) {
    console.error(error);
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc Update QA Bug
//@route PUT /api/project-error-qabug/update
const updateQaBug = asyncError(async (req, res) => {
  try {
    const { QaBug_id } = req.query;

    if (!QaBug_id) {
      return errorHandler(res, 404, "QaBug_id not found");
    }

    const {  comment } = req.body;

    // Validate QA Bug input
    const schema = Joi.object({
      comment: Joi.string().trim().min(3).required(),
    });

    const { error: validationError } = schema.validate({ comment });
    if (validationError) {
      return errorHandler(res, 400, validationError.message);
    }

    // Find and update QA Bug
    const updatedQABug = await QABug.findByIdAndUpdate(
      QaBug_id,
      {comment },
      { new: true }
    );

    if (!updatedQABug) {
      return errorHandler(res, 404, "QA Bug not found");
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First");
    }

    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: {
        message: "QA Bug Updated Successfully",
        result: updatedQABug,
      },
    });
  } catch (error) {
    console.error(error);
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc delete QA Bug
//@route DELETE /api/project-error-qabug/delete
const deleteQaBug = asyncError(async (req, res) => {
  try {
    const { QaBug_id } = req.query;

    if (!QaBug_id) {
      return errorHandler(res, 404, "QaBug_id not found");
    }

    // Find and delete QA Bug
    const deletedQABug = await QABug.findByIdAndDelete(QaBug_id);

    if (!deletedQABug) {
      return errorHandler(res, 404, "QA Bug not found");
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First");
    }
    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: {
        message: "QA Bug Deleted Successfully",
        // result: deletedQABug,
      },
    });
  } catch (error) {
    console.error(error);
    return errorHandler(res, 500, `${error.message}`);
  }
});

export {
  createQaBug,
  getQaBug,
  getQaBugByErrorId,
  getQaBugByProjectId,
  updateQaBug,
  deleteQaBug,
};
