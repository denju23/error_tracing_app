import express from 'express';
import {createError,getError,getErrorsOfProject,updateError,deleteError,dragError} from '../controllers/errorController.js'
const router = express.Router();


router.get('/',getError)
router.get("/all",getErrorsOfProject)
router.post('/new',createError)
router.put('/update',updateError)
router.put("/drag",dragError)
router.delete("/delete",deleteError)


export default router