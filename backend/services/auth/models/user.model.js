import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    displayName: {
        type: String,
        required: true
    },
    photoURL: {
        type: String,
        default: ''
    },
    credits: {
        type: Number,
        default: 100 // Default 100 credits for free tier
    },
    plan: {
        type: String,
        enum: ['free', 'starter', 'pro'],
        default: 'free'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
