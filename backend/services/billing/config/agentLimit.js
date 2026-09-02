// This rate limiter would typically use Redis, but for Zero Blockers we will implement a simple in-memory map.
const rateLimits = new Map();

export const agentRateLimiter = (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (!userId) return next();

  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10;

  if (!rateLimits.has(userId)) {
    rateLimits.set(userId, { count: 1, startTime: now });
    return next();
  }

  const userLimit = rateLimits.get(userId);
  if (now - userLimit.startTime > windowMs) {
    userLimit.count = 1;
    userLimit.startTime = now;
    return next();
  }

  if (userLimit.count >= maxRequests) {
    return res.status(429).json({ message: "Too many requests. Please slow down." });
  }

  userLimit.count++;
  next();
};
