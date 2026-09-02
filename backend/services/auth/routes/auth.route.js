import express from 'express';
import { login, logout, updateCredits, deductCredits } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/update-credits', updateCredits);
router.post('/deduct-credits', deductCredits);

export default router;