import redisClient from './redis.js';

export const verifySession = async (req, res, next) => {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            return res.status(401).json({ error: 'Unauthorized: No session cookie' });
        }

        const sessionData = await redisClient.get(`session:${sessionId}`);
        if (!sessionData) {
            return res.status(401).json({ error: 'Unauthorized: Invalid or expired session' });
        }

        req.user = JSON.parse(sessionData);
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
