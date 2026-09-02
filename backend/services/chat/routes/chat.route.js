import express from 'express';
import { createConversation, getConversations, getMessages } from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/conversations', createConversation);
router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);

export default router;
