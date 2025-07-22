import { errorHandler } from "../middleware/error.js";
import { asyncError } from "../middleware/catchAsyncError.js";
import { checkAuth } from "../middleware/auth.js";
import Project from '../models/projectModel.js';
import Error from '../models/errorModel.js';




//@desc Get Dashboard Data
//@route GET /api/dashboard
const getDashboardData = asyncError(async (req, res) => {
  try {
    const users = await checkAuth(req);
    if (!users) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }
    
    const getTotalNumberOfProjects = await Project.countDocuments({
        user: users?._id,
    });

    const getTotalNumberOfErrors = await Error.countDocuments({
      User_id: users._id,
    });

    let currentWeek = new Date();
    const weeklyErrorsArray = [];

    for (let i = 0; i < 4; i++) {
      const startOfWeek = new Date(currentWeek);
      startOfWeek.setDate(startOfWeek.getDate() - 7);

      const weekErrorsCount = await Error.countDocuments({
        User_id: users._id,
        createdAt: {
          $gte: startOfWeek,
          $lt: currentWeek,
        },
      });

      weeklyErrorsArray.push({
        start: startOfWeek,
        end: currentWeek,
        count: weekErrorsCount,
      });

      currentWeek = startOfWeek;
    }

    const topData = await Error
      .find({ User_id: users.id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      data: {
        NumberOfProjects: getTotalNumberOfProjects,
        NumberOfErrors: getTotalNumberOfErrors,
        weeklyErrors: weeklyErrorsArray,
        TopErrors: topData,
      },
      status: true,
      statusCode: 200,
    });
 
  } catch (error) {
    return errorHandler(res, 500, `${error.message}`);
  }
});

export { getDashboardData };
