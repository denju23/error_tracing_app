import express from 'express';
import { handleMemberInvitationResponse } from '../controllers/memberInvitationController.js';

const router = express.Router();

// Handle member invitation response
router.put('/:Member_id', handleMemberInvitationResponse);



export default router;