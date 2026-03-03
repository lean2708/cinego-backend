const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     description: Create a new account and return access token
 *     tags: [Auth]
 *     security: []   # Public API (không cần token)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - phone
 *               - password
 *               - confirm_password
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               phone:
 *                 type: string
 *                 example: 0901234567
 *               password:
 *                 type: string
 *                 example: 123456
 *               confirm_password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       201:
 *         description: Register successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Register account successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or phone already exists
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user and return access token
 *     tags: [Auth]
 *     security: []   # Public API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                     role:
 *                       type: string
 *                       example: USER
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", login);






module.exports = router;