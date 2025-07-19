import { errorHandler } from "../middleware/error.js";
import { asyncError } from "../middleware/catchAsyncError.js";
import { checkAuth } from "../middleware/auth.js";
import Member from "../models/memberModel.js";
import User from "../models/userModel.js";



//@desc Member Invitation Response
//@route PUT /api/:Member_id
const handleMemberInvitationResponse = asyncError(async (req, res) => {
  try {
    const { Member_id } = req.params;

    console.log( Member_id, "iddd");
    if (!Member_id) {
      return errorHandler(res, 400, "Member ID not provided");
    }

    const users = await checkAuth(req);
    if (!users) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }

    // Find the member by their Member Id
    const member = await Member.findById(Member_id);

    if (!member) {
      return errorHandler(res, 404, "Invitation not found or expired");
    }

    // Handle the member's response based on query parameters
    const { response } = req.body;

    if (response === "accept") {
      member.status = "accepted";
      member.isActive = true;
      await member.save();

      // Update user's project list with the accepted project
      const getProject = member.Project_id;
      await User.updateOne(
        { _id: users._id },
        { $push: { Projects: getProject } }
      );

      return res.status(200).json({
        status: true,
        statusCode: 200,
        data: { message: "Invitation accepted", result: member },
      });
    } else if (response === "reject") {
      member.status = "rejected";
      member.isActive = false;
      await member.save();

      return res.status(403).json({
        status: true,
        statusCode: 403,
        data: { message: "Invitation Rejected", result: member },
      });
    }

    // If the response is neither 'accept' nor 'reject'
    return res.status(400).json({
      status: false,
      statusCode: 404,
      data: { message: "Invalid response" },
    });
  } catch (error) {
    return errorHandler(res, 500, "An error occurred");
  }
});

export { handleMemberInvitationResponse };
