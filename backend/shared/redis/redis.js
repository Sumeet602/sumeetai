// Mocking Redis to remove the Docker dependency since virtualization is not supported on user's machine
class MockRedis {
    constructor() {
        this.cache = new Map();
        console.log('Connected to Mock Redis (In-Memory)');
    }

    on(event, callback) {
        // Mock event listener
        if (event === 'connect') {
            callback();
        }
    }

    async get(key) {
        return this.cache.get(key) || null;
    }

    async set(key, value, ...args) {
        this.cache.set(key, value);
        return 'OK';
    }
    
    async del(key) {
        this.cache.delete(key);
        return 1;
    }
}

const redisClient = new MockRedis();
export default redisClient;
