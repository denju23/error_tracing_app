import { errorHandler } from "../middleware/error.js";
import { asyncError } from "../middleware/catchAsyncError.js";
import { checkAuth } from "../middleware/auth.js";
import Joi from "joi";
import requestIp from "request-ip";
import Member from "../models/memberModel.js";
import projectSecret from "../models/projectSecretModel.js";
import Error from "../models/errorModel.js";
import Section from "../models/sectionModel.js";

//@desc Get Error
//@route GET /api/project-error
const getError = asyncError(async (req, res) => {
  try {
    const { Project_id, Error_id } = req.query;
    if (!Project_id) {
      return errorHandler(res, 404, "Project_id not found");
    }

    const error = await Error.findById(Error_id);
    if (!error) {
      return errorHandler(res, 404, "Error not found");
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }
    res.status(200).json({
      status: true,
      statusCode: 200,
      data: { message: "Error Retrived Successfully", result: error },
    });
  } catch (error) {
    console.log(error, "error");
    errorHandler(res, 400, "Something went wrong 🤦");
  }
});

//@desc Get All Error of Project
//@route GET /api/project-error/all
const getErrorsOfProject = asyncError(async (req, res) => {
  try {
    const { Project_id } = req.query;
    if (!Project_id) {
      return errorHandler(res, 404, "Project_id not found");
    }

    const error = await Error.find({ Project_id: Project_id });

    if (!error) {
      return errorHandler(res, 404, "Error not found");
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }
    res.status(200).json({
      status: true,
      statusCode: 200,
      data: { message: "Project Errors Retrived Successfully", result: error },
    });
  } catch (error) {
    console.log(error, "error");
    errorHandler(res, 400, "Something went wrong 🤦");
  }
});

//@desc update Error
//@route PUT /api/project-error/update
const updateError = asyncError(async (req, res) => {
  try {
    const { label, isQaDone, isDeveloperDone } = req.body;

    const { Project_id, Error_id } = req.query;

    if (!Project_id) {
      return errorHandler(res, 400, "Project_id Does not Exist");
    }

    if (!Error_id) {
      return errorHandler(res, 400, "Error_id Does not Exist");
    }
    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }
    // if (!req.body) {
    //   return errorHandler(res, 400, "Please provide all the necessary fields");
    // }

    console.log(label, isQaDone, isDeveloperDone, "edit item");
    const updatedError = await Error.findByIdAndUpdate(
      Error_id,
      {
        label,
        isQaDone,
        isDeveloperDone,
      },
      { new: true }
    );

    if (!updatedError) {
      return errorHandler(res, 404, "Error not found");
    }

    res.status(200).json({
      status: true,
      satusCode: 204,
      data: {
        message: "Error Update Request Processed Successfully 😍",
        result: updatedError,
      },
    });
  } catch (error) {
    console.log(error, "error");
    errorHandler(res, 400, "Something went wrong 🤦");
  }
});

//@desc update Error
//@route PUT /api/project-error/drag
const dragError = asyncError(async (req, res) => {
  try {
    const { isQaDone, isDeveloperDone } = req.body;

    const { Error_id, Project_id } = req.query;

    if (!Error_id) {
      return errorHandler(res, 400, "Error_id Does not Exist");
    }
    if (!Project_id) {
      return errorHandler(res, 400, "Project_id Does not Exist");
    }
    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }

    const dragError = await Error.findByIdAndUpdate(
      Error_id,
      {
        isQaDone,
        isDeveloperDone,
      },
      { new: true }
    );
    console.log(dragError, "dragError");
    if (!dragError) {
      return errorHandler(res, 404, "Error not found");
    }

    res.status(200).json({
      status: true,
      satusCode: 204,
      data: {
        message: "Status Updated Successfully",
        result: dragError,
      },
    });
  } catch (error) {
    console.log(error, "error");
    errorHandler(res, 400, "Something went wrong 🤦");
  }
});

//@desc delete Error
//@route DELETE /api/project-error/delete
const deleteError = asyncError(async (req, res) => {
  try {
    const { Project_id, Error_id } = req.query;

    if (!Project_id) {
      return errorHandler(res, 400, "Project_id Does not Exist");
    }

    if (!Error_id) {
      return errorHandler(res, 400, "Error_id Does not Exist");
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }

    const deletedError = await Error.findByIdAndDelete(Error_id);

    if (!deletedError) {
      return errorHandler(res, 500, "Error not found");
    }

    res.status(200).json({
      status: true,
      satusCode: 200,
      data: {
        message: "Error deleted successfully",
      },
    });
  } catch (error) {
    console.log(error, "error");
    errorHandler(res, 400, "Something went wrong 🤦");
  }
});

//@desc Create Error
//@route POST /api/project-error/new

const createError = asyncError(async (req, res) => {
  const detectedIp = requestIp.getClientIp(req);
  console.log(detectedIp, " User IP...");
  const ip = detectedIp.toString().replace("::ffff:", "");
  // console.log(req.headers.host,'HOST');
  console.log(req.headers["user-agent"], "browser...");

  try {
    const {
      label,
      title,
      path,
      description,
      type,
      titleOfImage,
      descriptionOfImage,
      appVersion,
      hostName,
      protocolUrl,
      platform,
    } = req.body;

    const { Project_id } = req.query;
    // console.log(Project_id,'Idddd')
    const ProjectValidation = Joi.object({
      label: Joi.string().trim().messages({
        "string.base": "label should be a type of a 'text' ",
        "string.empty": "label can not be empty field",
      }),
      title: Joi.string().trim().messages({
        "string.base": "title should be a type of a 'text' ",
        "string.empty": "title can not be empty field",
      }),
      path: Joi.string().trim().messages({
        "string.base": "path should be a type of a 'text' ",
        "string.empty": "path can not be empty field",
      }),
      description: Joi.string().trim().messages({
        "string.base": "description should be a type of a 'text' ",
        "string.empty": "description can not be empty field",
      }),
      type: Joi.string().trim().messages({
        "string.base": "type should be a type of a 'text' ",
        "string.empty": "type can not be empty field",
      }),
      titleOfImage: Joi.string().trim().messages({
        "string.base": "titleOfImage should be a type of a 'text' ",
        "string.empty": "titleOfImage can not be empty field",
      }),
      descriptionOfImage: Joi.string().trim().messages({
        "string.base": "errorDescriptionOfImage should be a type of a 'text' ",
        "string.empty": "descriptionOfImage can not be empty field",
      }),
      appVersion: Joi.string().trim().messages({
        "string.base": "appVersion should be a type of a 'text' ",
        "string.empty": "appVersion can not be empty field",
      }),
      hostName: Joi.string().trim().messages({
        "string.base": "hostName should be a type of a 'text' ",
        "string.empty": "hostName can not be empty field",
      }),
      protocolUrl: Joi.string().trim().messages({
        "string.base": "protocolUrl should be a type of a 'text' ",
        "string.empty": "protocolUrl can not be empty field",
      }),
      platform: Joi.string().trim().messages({
        "string.base": "platform should be a type of a 'text' ",
        "string.empty": "platform can not be empty field",
      }),
    });

    const { error } = ProjectValidation.validate({
      label,
      title,
      path,
      description,
      type,
      titleOfImage,
      descriptionOfImage,
      appVersion,
      hostName,
      protocolUrl,
      platform,
    });

    if (error) {
      return errorHandler(res, 400, error?.message);
    }
    if (!Project_id) {
      return errorHandler(res, 400, "Project_id");
    }

    const projectid = await projectSecret.find({ Project_id: Project_id });

    if (!projectid) {
      return errorHandler(res, 400, "Project Id Does not Exist");
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }

    const doFindUserMember = await Member.find({
      $and: [{ Project_id: Project_id }, { email: user.email }],
    });

    console.log(doFindUserMember, "doFindUserMember");
    const role = doFindUserMember.map((el) => el.role);
    if (role === "Developer") {
      return errorHandler(
        res,
        403,
        "You do not have the required role to perform this action"
      );
    }

    // Find the highest existing index in the database for this section
    const highestIndex = await Error
      .find({ Project_id })
      .sort({ index: -1 })
      .limit(1)
      .exec();

    const newIndex = highestIndex.length > 0 ? highestIndex[0].index + 1 : 0;

    const errordata = await Error.create({
      Project_id: Project_id,
      User_id: user?._id,
      label,
      title,
      path,
      description,
      type,
      browser: req.headers["user-agent"],
      ip: ip,
      titleOfImage,
      descriptionOfImage,
      appVersion,
      hostName,
      protocolUrl,
      platform,
      index: newIndex
    });

    // Create Section or Push Error in TotalError Array

    const doFindSection = await Section.find({ Project_id: Project_id });

    if (doFindSection.length === 0) {
      await Section.create({
        Project_id: Project_id,
        totalError: errordata._id,
      });
    } else {
      await Section.updateOne(
        { Project_id: Project_id },
        { $push: { totalError: errordata._id } }
      );
    }

    res.status(201).json({
      status: true,
      StatusCode: 201,
      data: {
        message: "Post Request Processed Successfully 😍",
        result: errordata,
      },
    });
  } catch (error) {
    console.log(error, "error");
    errorHandler(res, 400, "Something went wrong 🤦");
  }
});

export {
  createError,
  getError,
  getErrorsOfProject,
  updateError,
  dragError,
  deleteError,
};
