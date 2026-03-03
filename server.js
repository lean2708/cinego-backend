require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database'); 
const rootRouter = require('./routes'); 
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 8080;


app.use(cors()); 
app.use(express.json());


app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(rootRouter);
app.use(errorHandler);


app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({ alter: true });

    console.log("SERVER IS READY TO HANDLE REQUESTS !");

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});