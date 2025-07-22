import express from 'express';
import { handleMemberInvitationResponse,handleMemberRegistrationInvitationResponse } from '../controllers/memberInvitationController.js';

const router = express.Router();

//Handle User Registration while not registered 
router.put('/', handleMemberRegistrationInvitationResponse)


// Handle member invitation response
router.put('/:Member_id', handleMemberInvitationResponse);



export default router;