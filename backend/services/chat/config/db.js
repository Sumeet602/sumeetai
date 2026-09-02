import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/multi-agent-ai';
        await mongoose.connect(uri);
        console.log('Chat Service: MongoDB Connected successfully');
    } catch (error) {
        console.error('Chat Service: MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;
