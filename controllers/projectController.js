import { errorHandler } from "../middleware/error.js";
import { asyncError } from "../middleware/catchAsyncError.js";
import Project from "../models/projectModel.js";
import Member from "../models/memberModel.js";
import User from "../models/userModel.js";
import ProjectSecret from "../models/projectSecretModel.js";
import Error from "../models/errorModel.js";
import QABugs from "../models/QABugsModel.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import { checkAuth } from "../middleware/auth.js";
import CryptoJS from "crypto-js";
import Joi from "joi";
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import Cloudinary from "cloudinary";
import mongoose from "mongoose";
var cloudinary = Cloudinary.v2;
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
});

//@desc Get All Project
//@route GET /api/project
const getAllProject = asyncError(async (req, res) => {
  try {
    let { page, limit } = req.query;
    const skip = (page - 1) * 10;
    if (!page) page = 0;
    if (!limit) limit = 100;

    const resPerPage = 12;
    const projectCount = await Project.countDocuments();

    const apifilter = new ApiFeatures(Project.find(), req.query)
      .search()
      .filter();

    let getProjectDetails = await apifilter.query;
    const filterdProjectCount = Project.length;
    apifilter.pagination(resPerPage);

    const totalPages = Math.ceil(projectCount / resPerPage);

    getProjectDetails = await apifilter.query.clone();

    res.status(200).json({
      status: true,
      statusCode: 200,
      data: {
        projectCount: projectCount,
        resPerPage: resPerPage,
        totalPages,
        result: getProjectDetails,
      },
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc Get Project By ID
//@route GET /api/project/id

const getProjectById = asyncError(async (req, res) => {
  const projectId = req.params.id;
  try {
    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }

    // const GetProject = await Project.findById(projectId);

    const project_Info = await Project.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(projectId),
        },
      },
      {
        $lookup: {
          from: "errors",
          localField: "_id",
          foreignField: "Project_id",
          as: "error_list",
        },
      },
      {
        $lookup: {
          from: "qabugs",
          localField: "_id",
          foreignField: "Project_id",
          as: "qaComment_list",
        },
      },
    ]).then(function (project_Info, err) {
      if (err) {
        console.log(err, "err............");
      }

      return project_Info;
    });
    if (!project_Info) {
      return errorHandler(res, 400, "Project Not Found");
    }

    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: {
        message: "Project Retrived Successfully 😍",
        result: project_Info[0],
        // GetProject,
      },
    });
  } catch (error) {
    console.log("error>>>>>>>>>", error);
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc Add Project
//@route POST /api/project/new

const createProject = asyncError(async (req, res) => {
  let project_image;

  try {
    const { platform, title, gitUrl, description, domain } = req.body;

    const file = await req?.files?.project_img;
    console.log(file, 'file')
    project_image = await cloudinary?.uploader?.upload(file?.tempFilePath, {
      public_id: `${Date.now()}`,
      resource_type: "auto",
    });
    console.log(project_image, 'project_image')
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

    const AddprojectValidation = Joi.object({
      platform: Joi.string().trim().min(3).max(30).required().messages({
        "string.base": `platform should be a type of 'text'`,
        "string.empty": `platform cannot be an empty field`,
        "string.min": `platform length must be a {#limit} character`,
        "any.required": `platform is a required field`,
      }),
      title: Joi.string().trim().min(3).max(30).required().messages({
        "string.base": `projectTitle should be a type of 'text'`,
        "string.empty": `projectTitle cannot be an empty field`,
        "string.min": `projectTitle length must be a {#limit} character`,
        "any.required": `projectTitle is a required field`,
      }),
      description: Joi.string().trim().min(10).max(500).required().messages({
        "string.base": `description should be a type of 'text'`,
        "string.empty": `description cannot be an empty field`,
        "string.min": `description length must be a {#limit} character`,
        "any.required": `description is a required field`,
      }),
      gitUrl: Joi.string()
        .trim()
        .required()
        .pattern(
          new RegExp(
            /^([A-Za-z0-9]+@|http(|s)\:\/\/)([A-Za-z0-9.]+(:\d+)?)(?::|\/)([\d\/\w.-]+?)(\.git)?$/i
          )
        )
        .messages({
          "string.base": `gitUrl should be a type of 'text'`,
          "string.empty": `gitUrl cannot be an empty field`,
          "any.required": `gitUrl is a required field`,
          "string.pattern.base": "Please Enter Valid  gitUrl...",
        }),
      domain: Joi.string()
        .pattern(
          new RegExp(
            /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/
          )
        )
        .trim()
        .messages({
          "string.pattern.base": "Please Enter Valid Domain Name...",
        }),
    });
    const { error } = AddprojectValidation.validate({
      platform,
      title,
      gitUrl,
      description,
      domain,
    });
    if (error) {
      return errorHandler(res, 400, error?.message);
    }
    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }

    const getProject = await Project.create({
      platform,
      title: title,
      description,
      gitUrl,
      domain,
      user: user?._id,
      project_img: {
        public_id: project_image.public_id,
        url: project_image.url,
      },
    });
    // console.log(getProject, "create ");

    const uuid = uuidv4();
    const genrate_SecreteKey = uuid;
    let cipherText = user.email;
    let key = "123456";
    const genrate_AccessKey = CryptoJS.AES.encrypt(cipherText, key).toString();
    const project = await getProject?._id;
    const getSecretData = await ProjectSecret.create({
      secret_key: genrate_SecreteKey,
      access_key: genrate_AccessKey,
      User_id: user?._id,
      Project_id: project,
    });
    const addLoginUserAsMemberRoleOwner = await Member.create({
      Project_id: project,
      User_id: user?._id,
      username: user.username,
      email: user.email,
      role: "Owner",
      isActive: true,
      status: "accepted",
      expireAt: new Date().setDate(new Date().getDate() + 2),
    });

    const addProjectInUser = await User.updateOne(
      { _id: user._id },
      { $push: { Projects: getProject } }
    );
    res.status(201).json({
      status: true,
      StatusCode: 201,
      data: {
        message: "Project added successfully 😘",
        project: getProject,
        secrets: getSecretData,
      },
    });
  } catch (error) {
    console.log(error, "error...............");
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc Edit Project
//@route PUT /api/project/update/id
const updateProject = asyncError(async (req, res) => {
  try {
    const { platform, title, description, gitUrl, domain } = req.body;
    const user = await checkAuth(req);

    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { platform, title, description, gitUrl, domain },
      { new: true }
    );
    if (!updatedProject) {
      return errorHandler(res, 404, "Project Not Found");
    }

    res.status(200).json({
      status: true,
      StatusCode: 204,
      data: {
        message: "Project Updated Successfully 😍",
        result: updatedProject,
      },
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc Edit Project
//@route PUT /api/project/delete/id
const deleteProject = asyncError(async (req, res) => {
  try {
    const user = await checkAuth(req);

    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return errorHandler(res, 500, "Project not found");
    }

    // const doFindError = await Error.find({ Project_id: id })
    // console.log(doFindError,'Errorrrrrrrrrr')
    // const doFindErrorId = doFindError.map((el)=>el._id)
    // console.log(doFindErrorId,'doFindErrorId')
    // await QABugs.deleteMany({Error_id:doFindErrorId})

    // await Error.deleteMany({ Project_id: id })
    // await ProjectSecret.deleteMany({ Project_id: id })
    // await Member.deleteMany({ Project_id: id })

    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: {
        message: "Project deleted successfully",
      },
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

export {
  getAllProject,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
