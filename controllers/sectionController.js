import { errorHandler } from "../middleware/error.js";
import { asyncError } from "../middleware/catchAsyncError.js";
import { checkAuth } from "../middleware/auth.js";
import Section from "../models/sectionModel.js";
import Error from "../models/errorModel.js";
import mongoose from "mongoose";


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
    // const getAllErrors = await Error.find({ Project_id });
    // console.log(getAllErrors, "getAllErrors");
    // const getallSections = await Section.find({ Project_id });
    // console.log(getallSections);

     // Find all sections for the given Project_id and populate the error arrays
     const getallSections = await Section.find({ Project_id })
     .populate('totalError')
     .populate('isDeveloperDone')
     .populate('isQaDone')
     .populate('bothDone');

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
    return errorHandler(res, 500, `${error.message}`);
  }
});



//@desc Put Section
//@route PUT /api/sections


// send ID Only
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
    })

    console.log(sectionsToPullFrom,'sectionsToPullFrom')
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
    return errorHandler(res, 500, `${error.message}`);;
  }
});







// send object data 

// const updateSectionStatus = asyncError(async (req, res) => {
//   try {
//     let { oldIndex, newIndex, targetSection } = req.body;
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

//     // Assuming Error_id is a string representation of the ObjectId
//     const errorObjectId = new mongoose.Types.ObjectId(Error_id);

//     console.log(errorObjectId,"errorObjectId")

//     const sectionsToPullFrom = await Section.findOne({
//       Project_id,
//       $or: [
//         { totalError: { $elemMatch: { _id: errorObjectId } } },
//         { isDeveloperDone: { $elemMatch: { _id: errorObjectId } } },
//         { isQaDone: { $elemMatch: { _id: errorObjectId } } },
//         { bothDone: { $elemMatch: { _id: errorObjectId } } },
//       ],
//     });

//     console.log(sectionsToPullFrom, "sectionsToPullFrom");
//     if (!sectionsToPullFrom) {
//       return errorHandler(res, 404, "Error not found at Source Section");
//     }

//     const sectionArrays = [
//       "totalError",
//       "isDeveloperDone",
//       "isQaDone",
//       "bothDone",
//     ];

//     let sourceArrayName = "";
//     let errorIndex = -1; // Initialize with -1 to indicate not found

//     // Iterate through each section array
//     for (const arrayName of sectionArrays) {
//       const sectionArray = sectionsToPullFrom[arrayName];
//       console.log(sectionArray, "sectionArray");
//       const foundIndex = sectionArray.findIndex((error) =>
//         error._id.equals(errorObjectId)
//       );

//       if (foundIndex !== -1) {
//         sourceArrayName = arrayName;
//         errorIndex = foundIndex;
//         break; // Break the loop once the error is found
//       }
//     }

//     if (sourceArrayName) {
//       console.log(
//         `Error_id found in ${sourceArrayName} at index ${errorIndex}`
//       );
//     } else {
//       console.log("Error_id not found in any array.");
//     }

//     if (errorIndex != oldIndex) {
//       return errorHandler(
//         res,
//         400,
//         "Error with the provided Error_id was not found at the specified oldIndex"
//       );
//     }

//     // Check if in case targetSection array length is Zero and Requested index is one
//     if (sectionsToPullFrom[targetSection].length === 0) {
//       if (newIndex !== 0) {
//         return errorHandler(
//           res,
//           400,
//           "Target array is blank. You must move the Error_id to newIndex 0."
//         );
//       }
//     }

//     // Remove the error from its current position within the source section
//     const [movedError] = sectionsToPullFrom[sourceArrayName].splice(
//       oldIndex,
//       1
//     );
//     console.log(movedError, "movedError");
//     if (targetSection !== sourceArrayName) {
//       // If moving to a different section, insert the error at the newIndex in the destination section
//       sectionsToPullFrom[targetSection].splice(newIndex, 0, movedError);
//     } else {
//       // If staying in the same section, reinsert the error at the newIndex
//       sectionsToPullFrom[sourceArrayName].splice(newIndex, 0, movedError);
//     }

//     await sectionsToPullFrom.save();

//     res.status(200).json({
//       status: true,
//       statusCode: 200,
//       data: {
//         message: "Status Updated Successfully",
//       },
//     });
//   } catch (error) {
//     console.error(error, "error");
//     return errorHandler(res, 400, ``{error.message});
//   }
// });




export { getSectionsWithErrors, updateSectionStatus };
