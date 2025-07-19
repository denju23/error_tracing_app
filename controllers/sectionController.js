import { errorHandler } from "../middleware/error.js";
import { asyncError } from "../middleware/catchAsyncError.js";
import { checkAuth } from "../middleware/auth.js";
import Section from "../models/sectionModel.js";
import Error from "../models/errorModel.js";

//@desc Get Section
//@route GET /api/sections

const getSectionsWithErrors = asyncError(async (req, res) => {
  try {
    const { Project_id } = req.query;

    if (!Project_id) {
      return errorHandler(res, 400, "Project_id Does not Exist");
    }

    const user = await checkAuth(req);
    if (!user) {
      return errorHandler(res, 401, "Login First 🤦‍♂️");
    }
    const getAllErrors = await Error.find({ Project_id });
    // console.log(getAllErrors, "getAllErrors");
    const getallSections = await Section.find({ Project_id });
    // console.log(getallSections);

    res.status(200).json({
      status: true,
      StatusCode: 200,
      data: {
        message: "Section Data Retrived Successfully",
        result: getallSections,
      },
    });
  } catch (error) {
    console.log(error, "error");
    return errorHandler(res, 400, "something went wrong");
  }
});

// const updateSectionStatus = asyncError(async (req, res) => {
//   try {
//     const { isQaDone, isDeveloperDone, newIndex } = req.body;
//     console.log(
//       isQaDone,
//       isDeveloperDone,
//       newIndex,
//       "isQaDone, isDeveloperDone,newIndex"
//     );
//     const { Error_id, Project_id } = req.query;

//     if (!Error_id) {
//       return errorHandler(res, 400, "Error_id Does not Exist");
//     }
//     if (!Project_id) {
//       return errorHandler(res, 400, "Project_id Does not Exist");
//     }
//     const user = await checkAuth(req);
//     if (!user) {
//       return errorHandler(res, 401, "Login First 🤦‍♂️");
//     }

//     const dragError = await Error.findByIdAndUpdate(
//       Error_id,
//       {
//         isQaDone,
//         isDeveloperDone,
//       },
//       { new: true }
//     );
//     console.log(dragError, "dragError");
//     console.log(dragError.index, "dragError.index");
//     if (!dragError) {
//       return errorHandler(res, 404, "Error not found");
//     }

//     // Determine the sections to pull from based on the error ID
//     const sectionsToPullFrom = await Section.find({
//       Project_id,
//       $or: [
//         { totalError: dragError._id },
//         { isDeveloperDone: dragError._id },
//         { isQaDone: dragError._id },
//         { bothDone: dragError._id },
//       ],
//     });

//     if (sectionsToPullFrom.length === 0) {
//       return errorHandler(res, 404, "Error not found in any section");
//     }
//     console.log(sectionsToPullFrom, "sectionsToPullFrom");

//
//     // Determine the sections to push to based on the state
//     const sectionToUpdate = {};

//     if (dragError.isDeveloperDone === false && dragError.isQaDone === false) {
//       sectionToUpdate.totalError = dragError;
//     } else if (
//       dragError.isDeveloperDone === true &&
//       dragError.isQaDone === false
//     ) {
//       sectionToUpdate.isDeveloperDone = dragError;
//     } else if (
//       dragError.isDeveloperDone === false &&
//       dragError.isQaDone === true
//     ) {
//       sectionToUpdate.isQaDone = dragError;
//     } else if (
//       dragError.isDeveloperDone === true &&
//       dragError.isQaDone === true
//     ) {
//       sectionToUpdate.bothDone = dragError;
//     }

//     console.log(sectionToUpdate, "sectionToUpdate");

//     // Update the sections to pull from and push to

//     for (const section of sectionsToPullFrom) {
//       console.log(section, "section");
//       await Section.updateOne(
//         { _id: section._id },
//         {
//           $pull: {
//             totalError: dragError._id,
//             isDeveloperDone: dragError._id,
//             isQaDone: dragError._id,
//             bothDone: dragError._id,
//           },
//         }
//       );

//       await Section.updateOne({ Project_id }, { $push: sectionToUpdate });
//     }

//     res.status(200).json({
//       status: true,
//       statusCode: 204,
//       data: {
//         message: "Status Updated Successfully",
//         result: dragError,
//       },
//     });
//   } catch (error) {
//     console.log(error, "error");
//     return errorHandler(res, 400, "something went wrong");
//   }
// });


//@desc Update Section
//@route PUT /api/sections/update

const updateSectionStatus = asyncError(async (req, res) => {
  try {
    let {oldIndex, newIndex, targetSection } =
      req.body;
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

    const sectionsToPullFrom = await Section.findOne({
      Project_id,
      $or: [
        { totalError: Error_id },
        { isDeveloperDone: Error_id },
        { isQaDone: Error_id },
        { bothDone: Error_id },
      ],
    });

    if (!sectionsToPullFrom) {
      return errorHandler(res, 404, "Error not found at Source Section");
    }

    // Determine the source array name based on where the error ID is found
    let sourceArrayName = "";
    if (sectionsToPullFrom.totalError.includes(Error_id)) {
      sourceArrayName = "totalError";
    } else if (sectionsToPullFrom.isDeveloperDone.includes(Error_id)) {
      sourceArrayName = "isDeveloperDone";
    } else if (sectionsToPullFrom.isQaDone.includes(Error_id)) {
      sourceArrayName = "isQaDone";
    } else if (sectionsToPullFrom.bothDone.includes(Error_id)) {
      sourceArrayName = "bothDone";
    }



    // Check if the error exists at the specified oldIndex in the source section
    const errorExistsAtOldIndex = sectionsToPullFrom[sourceArrayName].findIndex(
      (error) => error.toString() === Error_id
    );

    if (errorExistsAtOldIndex != oldIndex) {
      return errorHandler(
        res,
        400,
        "Error with the provided Error_id was not found at the specified oldIndex"
      );
    }

  // Check if in case targetSection array length is Zero and Requested index is one 
  if (sectionsToPullFrom[targetSection].length === 0) {
      if (newIndex !== 0) {
        return errorHandler(
          res,
          400,
          "Target array is blank. You must move the Error_id to newIndex 0."
        );
      }
    }

    // Remove the error from its current position within the source section
    const [movedError] = sectionsToPullFrom[sourceArrayName].splice(oldIndex, 1);

    if (targetSection !== sourceArrayName) {
      // If moving to a different section, insert the error at the newIndex in the destination section
      sectionsToPullFrom[targetSection].splice(newIndex, 0, movedError);
    } else {
      // If staying in the same section, reinsert the error at the newIndex
      sectionsToPullFrom[sourceArrayName].splice(newIndex, 0, movedError);
    }

    // Save the source section (no need to save the destination section separately)
    await sectionsToPullFrom.save();

    res.status(200).json({
      status: true,
      statusCode: 200,
      data: {
        message: "Status Updated Successfully",
      },
    })
  } catch (error) {
    console.error(error);
    return errorHandler(res, 400, "Something went wrong");
  }
});









export { getSectionsWithErrors, updateSectionStatus };
