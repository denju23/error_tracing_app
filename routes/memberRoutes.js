import express from 'express';
import {createMember,getAllMemberOfProject,getMember,updateMember,deleteMember} from '../controllers/memberController.js'
const router = express.Router();

// Routes
router.get('/all',getAllMemberOfProject)
router.get("/",getMember)
router.post("/new",createMember)
router.put("/update",updateMember)
router.delete("/delete",deleteMember)


export default router

