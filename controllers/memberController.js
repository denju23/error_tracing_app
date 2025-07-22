import { errorHandler } from "../middleware/error.js";
import { asyncError } from "../middleware/catchAsyncError.js";
import { checkAuth } from "../middleware/auth.js";
import Joi from "joi";
import User from "../models/userModel.js";
import Project from "../models/projectModel.js";
import Member from "../models/memberModel.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import ejs from "ejs";
import { sendEmail } from "../config/email.js";

//@desc Get member of project
//@route GET /api/project-member/all

const getAllMemberOfProject = asyncError(async (req, res) => {
  try {
    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }

    const { Project_id } = req.query;
    const isProject = await Project.findById(Project_id);
    if (!isProject) {
      return errorHandler(res, 400, "Project Not Found");
    }
    const members = await Member.find({ Project_id: Project_id });
    const numberOfMembers = members.length;

    if (!members) {
      return errorHandler(res, 404, "Member not found");
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      data: {
        message: "Project Members Retrived Successfully",
        members,
        numberOfMembers,
      },
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc Get Singal member
//@route GET /api/project-member
const getMember = asyncError(async (req, res) => {
  try {
    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }

    const { Member_id } = req.query;

    if (!Member_id) {
      return errorHandler(res, 400, "Member_id is required");
    }

    const member = await Member.findById(Member_id);
    if (!member) {
      return errorHandler(res, 404, "Member not found");
    }

    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: { message: "Member Retrived Successfully", result: member },
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc update member
//@route PUT /api/project-member/update
const updateMember = asyncError(async (req, res) => {
  try {
    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }
    const { username, email, role, isActive, expireAt } = req.body;

    const { Member_id } = req.query;

    if (!Member_id) {
      return errorHandler(res, 400, "Member_id is required");
    }

    const updatedMember = await Member.findByIdAndUpdate(
      Member_id,
      { username, email, role, isActive, expireAt },
      { new: true }
    );
    if (!updatedMember) {
      return errorHandler(res, 404, "Member Not Found");
    }

    const doFindRoleOfMember = await Member.find({ email: user.email });

    if (doFindRoleOfMember.role === "Maintainer") {
      return errorHandler(
        res,
        403,
        "You do not have the required role to perform this action"
      );
    }
    res.status(200).json({
      status: true,
      StatusCode: 204,
      data: {
        message: "Member Updated Successfully 😍",
        result: updatedMember,
      },
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc delete member Invitation Request
//@route DELETE /api/project-member/delete
const deleteMember = asyncError(async (req, res) => {
  try {
    const { Project_id, Member_id } = req.query;
    if (!Project_id) {
      return errorHandler(res, 400, "Project_id is required");
    }
    if (!Member_id) {
      return errorHandler(res, 400, "Member_id is required");
    }

    const deletedMember = await Member.findByIdAndDelete(Member_id);

    if (!deletedMember) {
      return errorHandler(res, 404, "Member not found");
    }

    // const doFindRoleOfMember = await Member.findById(id);

    // console.log(doFindRoleOfMember, "doFindRoleOfMember");

    // const role = doFindRoleOfMember.map((el) => el.role);
    // if (role === "Developer") {
    //   return errorHandler(
    //     res,
    //     403,
    //     "You do not have the required role to perform this action"
    //   );
    // }

    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: { message: "Member Deleted successfully" },
    });
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

//@desc Add member in project
//@route POST /api/project-member/new

const createMember = asyncError(async (req, res) => {
  try {
    const { username, email, role, isActive, expireAt } = req.body;
    const { Project_id } = req.query;

    if (!Project_id) {
      return errorHandler(res, 400, "Project_id is required");
    }

    const isProject = await Project.findById(Project_id);
    if (!isProject) {
      return errorHandler(res, 400, "Project Not Found");
    }

    const MemberValidation = Joi.object({
      username: Joi.string().trim().min(3).max(30).required().messages({
        "string.base": "username should be a type of a 'text' ",
        "string.empty": "username can not be empty field",
        "string.min": "User name should have a minimum length of 3",
        "string.max": "User name should have maximum length of 30",
        "any.required": "Member name is required field",
      }),
      email: Joi.string()
        .required()
        .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
        .messages({
          "string.base": "Member Email should be type of 'text'",
          "string.empty": "Member Email can not be empty field",
          "any.required": "Member email is required field",
        }),
      role: Joi.string().trim().required().messages({
        "string.base": "role should be a type of a 'text' ",
        "string.empty": "role can not be empty field",
        "any.required": "Member role is required field",
      }),
    });

    const { error } = MemberValidation.validate({ username, email, role });

    if (error) {
      return errorHandler(res, 400, error?.message);
    }

    const user = await checkAuth(req);

    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }

    const doFindEmailRegistered = await User.find({ email: email });

    if (doFindEmailRegistered.length === 0) {
      const newUser = new User({
        username,
        email,
        isUserRegistered: false,
      });

      await newUser.save();

      const memberdata = await Member.create({
        Project_id: Project_id,
        username,
        email,
        role,
        isActive,
        expireAt,
      });

      const registrationToken = jwt.sign(
        { email, username },
        process.env.JWT_SECRET,
        { expiresIn: "2d" }
      );

      const registrationTemplateData = {
        username,
        email,
        invitationLink: `http://localhost:4000/user/${newUser._id}/registration-invitation?token=${registrationToken}`,
      };

      const memberInvitationTemplateData = {
        username,
        Project_id: Project_id,
        role,
        email,
        ProjectInfo:isProject,
        invitationLink: `http://localhost:4000/project/${Project_id}/member-invitation/${memberdata._id}`,
      };
      
      console.log(memberInvitationTemplateData);

      // Send registration email
      await sendEmail(
        email,
        "You have been Invited to Register",
        "userRequest.ejs",
        registrationTemplateData
      );

      // Send member invitation email
      await sendEmail(
        email,
        "You have been Invited to join Project",
        "memberRequest.ejs",
        memberInvitationTemplateData
      );

      return res.status(200).json({
        status: true,
        StatusCode: 200,
        data: {
          message: `Invitation to register sent successfully 😍`,
        },
      });
    }

    const doFindUserMember = await Member.find({
      $and: [{ Project_id: Project_id }, { email: email }],
    });

    if (doFindUserMember.length !== 0) {
      return errorHandler(
        res,
        403,
        "Member already Registered with this email"
      );
    } else {
      const memberdata = await Member.create({
        Project_id: Project_id,
        username,
        email,
        role,
        isActive,
        expireAt,
      });

      const memberInvitationTemplateData = {
        username,
        Project_id: Project_id,
        role,
        email,
        ProjectInfo:isProject,
        invitationLink: `http://localhost:4000/project/${Project_id}/member-invitation/${memberdata._id}`,
      };

      // Send member invitation email
      await sendEmail(
        email,
        "You have been Invited to join Project",
        "memberRequest.ejs",
        memberInvitationTemplateData
      );

      res.status(200).json({
        status: true,
        StatusCode: 200,
        data: {
          message: `Member Invitation send Successfully 😍`,
          result: memberdata,
        },
      });
    }
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

export {
  createMember,
  getAllMemberOfProject,
  getMember,
  updateMember,
  deleteMember,
};
