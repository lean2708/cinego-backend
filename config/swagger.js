const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
require('dotenv').config();

const options = {
  definition: {
    openapi: '3.0.0', 
    info: {
      title: 'CineGo API Documentation',
      version: '1.0.0',
      description: 'System API for CineGo movie ticket booking application.',
    },
    servers: [
      {
        url: process.env.API_URL,
        description: 'Development Server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: { 
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Điền Access Token (JWT) vào đây (không cần "Bearer ")'
        }
      }
    },
    security: [
      {
        BearerAuth: [] // Áp dụng bảo mật cho toàn bộ API (có thể tắt ở từng API)
      }
    ]
  },
  apis: [
    path.join(__dirname, '../routes/**/*.js'),
    path.join(__dirname, '../controllers/**/*.js'),
    path.join(__dirname, '../models/**/*.js')
  ], 
};

const specs = swaggerJsdoc(options);

module.exports = specs;