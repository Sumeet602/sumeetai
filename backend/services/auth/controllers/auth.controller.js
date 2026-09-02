import { getAuth } from 'firebase-admin/auth';
import User from '../models/user.model.js';
import redisClient from './redis.js';
import crypto from 'crypto';

export const login = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) return res.status(400).json({ error: 'idToken is required' });

        // Verify Firebase Token
        let decodedToken;
        try {
            decodedToken = await getAuth().verifyIdToken(idToken);
        } catch (error) {
            return res.status(401).json({ error: 'Invalid Firebase token' });
        }

        const { uid, email, name, picture } = decodedToken;

        // Upsert User in MongoDB
        let user = await User.findOne({ firebaseUid: uid });
        if (!user) {
            user = await User.create({
                firebaseUid: uid,
                email: email,
                displayName: name || 'User',
                photoURL: picture || ''
            });
        }

        // Generate Session ID
        const sessionId = crypto.randomUUID();

        // Store Session in Redis (expires in 7 days)
        await redisClient.set(`session:${sessionId}`, JSON.stringify({
            userId: user._id,
            email: user.email,
            plan: user.plan
        }), 'EX', 7 * 24 * 60 * 60);

        // Send Session Cookie
        res.cookie('sessionId', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const logout = async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        if (sessionId) {
            await redisClient.del(`session:${sessionId}`);
            res.clearCookie('sessionId');
        }
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateCredits = async (req, res) => {
    try {
        const { userId, plan } = req.body;
        if (!userId || !plan) return res.status(400).json({ error: 'userId and plan are required' });

        const planCredits = {
            'starter': 500,
            'pro': 2000
        };
        const additionalCredits = planCredits[plan] || 0;

        const user = await User.findByIdAndUpdate(
            userId,
            { 
                $inc: { credits: additionalCredits },
                $set: { plan: plan }
            },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: 'User not found' });

        return res.status(200).json({ message: 'Credits updated', credits: user.credits });
    } catch (error) {
        console.error('Update Credits Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deductCredits = async (req, res) => {
    try {
        const { userId, amount } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId is required' });

        const deductAmount = amount || 1;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.credits < deductAmount) {
            return res.status(402).json({ error: 'Insufficient credits' });
        }

        user.credits -= deductAmount;
        await user.save();

        return res.status(200).json({ message: 'Credits deducted', credits: user.credits });
    } catch (error) {
        console.error('Deduct Credits Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};