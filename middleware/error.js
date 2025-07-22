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
  
 
  


  export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};