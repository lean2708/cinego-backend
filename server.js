require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const sequelize = require('./config/database'); 
const rootRouter = require('./routes'); 
const errorHandler = require("./middlewares/errorHandler");
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const createDefaultAdmin = require('./utils/initDefaultData');
const initializeSocket = require('./utils/socketHandler');
const initializeAssociations = require('./models/associations');
const redisClient = require('./config/redis');

const { startOrderTimeoutJob } = require('./cron/orderTimeout');
const initSeatExpiryListener = require('./redis/seatExpiryListener');
const { startSeatCleanupJob } = require('./redis/seatCleanup');

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*', 
        methods: ['GET', 'POST'],
        credentials: true
    }
});

app.use(cors({
    origin: process.env.CLIENT_URL || '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use(rootRouter);
app.use(errorHandler);

initializeAssociations();

redisClient.on("connect", () => {
    console.log("🔄 Redis đang thiết lập kết nối...");
});

redisClient.on("ready", async () => {
    console.log("🟢 Redis đã sẵn sàng kết nối!");
    try {
        initializeSocket(io);
        await initSeatExpiryListener(io, redisClient);
    } catch (err) {
        console.error("❌ Lỗi khi khởi tạo bộ lắng nghe Redis:", err);
    }
});

redisClient.on("error", (err) => {
    console.error("❌ [REDIS SYSTEM ERROR]:", err);
});

server.listen(PORT, async () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);

    try {
        await sequelize.authenticate();
        console.log('✅ Database connection has been established successfully.');
        
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized successfully.');
        
        await createDefaultAdmin();
        
        startOrderTimeoutJob(); 
        startSeatCleanupJob(io); 

    } catch (error) {
        console.error('❌ CRITICAL ERROR during server startup sequence:', error);
        process.exit(1);
    }
});