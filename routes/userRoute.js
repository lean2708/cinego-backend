const express = require("express");
const {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser,
    uploadAvatar
} = require("../controllers/userController");

const { authToken, isAdmin } = require("../middlewares/authToken");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */


/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
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
 *               - role
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: Nguyen Van B
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               phone:
 *                 type: string
 *                 example: 0901234567
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 example: USER
 *     responses:
 *       201:
 *         description: Create user successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or phone already exists
 */
router.post("/", authToken, isAdmin, createUser);


/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Pagination)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Get all users successfully
 */
router.get("/", authToken, isAdmin, getAllUsers);


/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by id
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Get user successfully
 *       404:
 *         description: User not found
 */
router.get("/:id", authToken, getUserById);



/**
 * @swagger
 * /users/avatar:
 *   put:
 *     summary: Upload or update user avatar
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       example: "https://example.com/uploads/avatar.jpg"
 */
router.put("/avatar", authToken, upload.single("avatar"), uploadAvatar);



/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               gender:
 *                 type: string
 *                 example: MALE
 *               dob:
 *                 type: string
 *                 example: 2000-01-01
 *     responses:
 *       200:
 *         description: Update user successfully
 */
router.put("/:id", authToken, updateUser);


/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Soft delete user
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Delete user successfully
 *       404:
 *         description: User not found
 */
router.delete("/:id", authToken, deleteUser);


module.exports = router;