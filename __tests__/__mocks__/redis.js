// __tests__/__mocks__/redis.js

// Mock implementation for the Redis client from @upstash/redis
export const Redis = {
  fromEnv: jest.fn().mockReturnValue({
    // Basic key-value operations
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(1),
    incr: jest.fn().mockResolvedValue(1),
    incrby: jest.fn().mockResolvedValue(1),
    decr: jest.fn().mockResolvedValue(0),
    decrby: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(true),
    ttl: jest.fn().mockResolvedValue(3600),
    
    // Hash operations
    hget: jest.fn().mockResolvedValue(null),
    hgetall: jest.fn().mockResolvedValue({}),
    hset: jest.fn().mockResolvedValue(1),
    hdel: jest.fn().mockResolvedValue(1),
    hincrby: jest.fn().mockResolvedValue(1),
    hexists: jest.fn().mockResolvedValue(1),
    
    // List operations
    lpush: jest.fn().mockResolvedValue(1),
    rpush: jest.fn().mockResolvedValue(1),
    lpop: jest.fn().mockResolvedValue(null),
    rpop: jest.fn().mockResolvedValue(null),
    lrange: jest.fn().mockResolvedValue([]),
    
    // Set operations
    sadd: jest.fn().mockResolvedValue(1),
    srem: jest.fn().mockResolvedValue(1),
    smembers: jest.fn().mockResolvedValue([]),
    sismember: jest.fn().mockResolvedValue(1),
    
    // Sorted set operations
    zadd: jest.fn().mockResolvedValue(1),
    zrem: jest.fn().mockResolvedValue(1),
    zrange: jest.fn().mockResolvedValue([]),
    zrevrange: jest.fn().mockResolvedValue([]),
    zremrangebyscore: jest.fn().mockResolvedValue(1),
    zremrangebyrank: jest.fn().mockResolvedValue(1),
    zcount: jest.fn().mockResolvedValue(5),
    zscore: jest.fn().mockResolvedValue(1),
    
    // Transaction operations
    multi: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
    
    // PubSub operations
    publish: jest.fn().mockResolvedValue(1),
    subscribe: jest.fn().mockImplementation((channel, callback) => {
      // Return unsubscribe function
      return jest.fn();
    }),
    
    // Scripting
    eval: jest.fn().mockResolvedValue(null),
    
    // Pipeline
    pipeline: jest.fn().mockReturnThis(),
    
    // Database operations
    select: jest.fn().mockResolvedValue('OK'),
    flushdb: jest.fn().mockResolvedValue('OK'),
    flushall: jest.fn().mockResolvedValue('OK'),
    
    // Custom response setter for tests
    __setMockResponse: jest.fn().mockImplementation(function(method, response) {
      this[method].mockResolvedValue(response);
      return this;
    })
  }),
  
  // Class-based variant for when Redis is used with 'new'
  new: jest.fn().mockImplementation(() => Redis.fromEnv())
};

// Shorthand for configuring mock responses
export const configureMockRedis = (redis, configs = {}) => {
  Object.entries(configs).forEach(([method, response]) => {
    redis[method].mockResolvedValue(response);
  });
  return redis;
};
