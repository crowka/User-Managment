export const Redis = {
  fromEnv: jest.fn().mockReturnValue({
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(true),
    get: jest.fn().mockResolvedValue(null),
    zadd: jest.fn().mockResolvedValue(1),
    zremrangebyscore: jest.fn().mockResolvedValue(1),
    zcount: jest.fn().mockResolvedValue(5)
  })
};
