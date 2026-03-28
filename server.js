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

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST']
    }
});

app.use(express.json());

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(rootRouter);
app.use(errorHandler);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

const initializeAssociations = require('./models/associations');
initializeAssociations();
initializeSocket(io);
server.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    await sequelize.sync({ alter: true });

    await createDefaultAdmin();

    console.log("SERVER IS READY TO HANDLE REQUESTS !");

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});