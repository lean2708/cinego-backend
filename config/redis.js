const { default: Redis } = require("ioredis");
require("dotenv").config();

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});

redisClient.on("connect", () => {
    console.log("Connected to Redis server successfully");
});

redisClient.on("ready", async () => {
    try {
        const res = await redisClient.config("GET", "notify-keyspace-events");
        const current = Array.isArray(res) ? res[1] : res;

        if (!current || !current.includes("E") || !current.includes("x")) {
            await redisClient.config("SET", "notify-keyspace-events", "Ex");
            console.log("Redis notify-keyspace-events set to Ex");
        }
    } catch (err) {
        console.error("Redis config error:", err.message);
    }
});

redisClient.on("error", (error) => {
    console.error("Redis connection error:", error.message);
});

module.exports = redisClient;