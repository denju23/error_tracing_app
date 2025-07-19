import { errorHandler } from "./error.js";
// import {errorHandler} from '../utils/errorHandler.js'

export const asyncError = (passedFunc) => (req, res) => {
    return Promise.resolve(passedFunc(req, res)).catch((err) => {
      return errorHandler(res, 500, err.message);
    });
  };