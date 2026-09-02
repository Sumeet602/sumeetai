import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3
});

redisClient.on('connect', () => {
    console.log(`Connected to Redis at ${redisUrl}`);
});

redisClient.on('error', (err) => {
    console.error('Redis Connection Error:', err);
});

export default redisClient;
