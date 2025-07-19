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
  
 
  