import express from 'express';
import { getSuggestedConnections } from '../controllers/user.controller.js';

const router=express.Router();

router.get("/suggestedProfile",getSuggestedConnections);

export default router;