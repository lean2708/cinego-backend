const express = require("express");

const {
    createFood,
    getFoodById,
    getAllFoodsForAdmin,
    getAllFoodsForUser,
    updateFood,
    deleteFood
} = require("../controllers/foodController");

const { authToken, isAdmin } = require("../middlewares/authToken");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Foods
 *   description: Food management APIs
 */


/**
 * @swagger
 * /foods:
 *   post:
 *     summary: Create new food (Admin)
 *     tags: [Foods]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pizza Hải Sản
 *               image_url:
 *                 type: string
 *                 example: https://image.com/pizza.jpg
 *               description:
 *                 type: string
 *                 example: Pizza hải sản đặc biệt
 *               price:
 *                 type: number
 *                 example: 120000
 *               stock_quantity:
 *                 type: integer
 *                 example: 50
 *               is_available:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Create food successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Food name already exists
 */
router.post("/", authToken, isAdmin, createFood);



/**
 * @swagger
 * /foods/admin:
 *   get:
 *     summary: Get all foods for Admin (Pagination)
 *     tags: [Foods]
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
 *         description: Get all foods successfully
 */
router.get("/admin", authToken, isAdmin, getAllFoodsForAdmin);



/**
 * @swagger
 * /foods:
 *   get:
 *     summary: Get all foods for User
 *     tags: [Foods]
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
 *         description: Get foods for user successfully
 */
router.get("/", getAllFoodsForUser);



/**
 * @swagger
 * /foods/{id}:
 *   get:
 *     summary: Get food by id
 *     tags: [Foods]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Get food successfully
 *       404:
 *         description: Food not found
 */
router.get("/:id", getFoodById);



/**
 * @swagger
 * /foods/{id}:
 *   put:
 *     summary: Update food (Admin only)
 *     tags: [Foods]
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
 *               name:
 *                 type: string
 *               image_url:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock_quantity:
 *                 type: integer
 *               is_available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Update food successfully
 *       404:
 *         description: Food not found
 */
router.put("/:id", authToken, isAdmin, updateFood);



/**
 * @swagger
 * /foods/{id}:
 *   delete:
 *     summary: Soft delete food (Admin only)
 *     tags: [Foods]
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
 *         description: Delete food successfully
 *       404:
 *         description: Food not found
 */
router.delete("/:id", authToken, isAdmin, deleteFood);



module.exports = router;