import express from 'express';
import { getAllProject,getProjectById,createProject,updateProject,deleteProject } from '../controllers/projectController.js';
import { checkAuth } from '../middleware/auth.js';
const router = express.Router();

router.get('/',getAllProject)
router.get("/:id",getProjectById)
router.post("/new", createProject);
router.put("/update/:id",updateProject)
router.delete("/delete/:id",deleteProject)


export default router

