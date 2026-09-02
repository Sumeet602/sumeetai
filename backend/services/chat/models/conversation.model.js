import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    userId: {
        type: String, // Storing the x-user-id from headers
        required: true,
        index: true
    },
    title: {
        type: String,
        default: 'New Conversation'
    },
    agentUsed: {
        type: String, // e.g. 'coding', 'chat', 'vision'
        default: 'chat'
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
