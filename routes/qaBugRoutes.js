import express from 'express';
import { createQaBug,getQaBug,getQaBugByErrorId,getQaBugByProjectId,updateQaBug,deleteQaBug} from '../controllers/qaBugController.js';
const router = express.Router();




// Create a new QA Bug
router.post('/new', createQaBug);

// Get a QA Bug by ID
router.get('/', getQaBug);


// Get QA Bugs by Error ID
router.get('/error', getQaBugByErrorId);

// Get QA Bugs by Project ID
router.get('/project', getQaBugByProjectId);


// Edit a QA Bug by ID
router.put('/update', updateQaBug);

// Delete a QA Bug by ID
router.delete('/delete', deleteQaBug);


export default router