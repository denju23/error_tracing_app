// class ErrorHandler extends Error{
//     constructor(message,statusCode){
//         super(message);
//         this.statusCode = statusCode

//         Error.captureStackTrace(this,this.constructor);

//     }
    
// }

// module.exports = ErrorHandler



export const errorHandler = (
    res,
    statusCode = 500,
    message = "internal server error"
  ) => {
    return res.status(statusCode).json({
      status: false,
      message,
    });
  };