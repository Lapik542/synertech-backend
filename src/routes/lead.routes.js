import express from 'express';
import { postLead } from '../controllers/lead.controller.js';

const router = express.Router();

router.post('/leads', postLead);

export default router;