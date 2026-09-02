import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

export const createConversation = async (req, res) => {
    try {
        const userId = req.headers['x-user-id']; // Passed from gateway
        const { title, agentUsed } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized: Missing user ID' });
        }

        const conversation = await Conversation.create({
            userId,
            title: title || 'New Conversation',
            agentUsed: agentUsed || 'chat'
        });

        res.status(201).json(conversation);
    } catch (error) {
        console.error('Create Conversation Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getConversations = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 });
        res.status(200).json(conversations);
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMessages = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        const { conversationId } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Verify ownership
        const conversation = await Conversation.findOne({ _id: conversationId, userId });
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
