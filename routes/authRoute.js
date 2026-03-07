const express = require("express");
const { register, login, forgotPassword,verifyOtp, resetPassword, getMyProfile, changePassword } = require("../controllers/authController");
const { authToken } = require("../middlewares/authToken");

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
 *                 example: 09123456782
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



/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Step 1 - Send OTP to email for password reset
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 */
router.post("/forgot-password", forgotPassword);



/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Step 2 - Verify OTP for password reset
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: OTP invalid or expired
 */
router.post("/verify-otp", verifyOtp);


/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Step 3 - Reset password using reset token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 example: newPass123
 *               confirmPassword:
 *                 type: string
 *                 example: newPass123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid request
 */
router.post("/reset-password", resetPassword);


/**
 * @swagger
 * /auth/myInfo:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieve authenticated user's profile information
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
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
 *                   example: Get my info
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         full_name:
 *                           type: string
 *                           example: Nguyen Van A
 *                         email:
 *                           type: string
 *                           example: test@gmail.com
 *                         phone:
 *                           type: string
 *                           example: 0901234567
 *                         role:
 *                           type: string
 *                           example: USER
 *       401:
 *         description: Unauthorized - Token missing or invalid
 *       403:
 *         description: Forbidden
 */
router.get("/myInfo", authToken, getMyProfile);





/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Change password for logged-in user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "oldPass123"
 *               newPassword:
 *                 type: string
 *                 example: "newPass456"
 *               confirmPassword:
 *                 type: string
 *                 example: "newPass456"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password or mismatch
 */
router.put("/change-password", authToken, changePassword);


module.exports = router;