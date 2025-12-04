import { Router } from 'express';
import { postLead } from '../controllers/lead.controller.js';

const router = Router();

router.post('/', postLead);

export default router;
