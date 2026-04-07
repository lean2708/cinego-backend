const express = require("express");
const {
    createActor,
    getAllActors,
    getActorById,
    updateActor,
    deleteActor
} = require("../controllers/actorController");

const { authToken, isAdmin } = require("../middlewares/authToken");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Actors
 *   description: Actor management APIs
 */


/**
 * @swagger
 * /actors:
 *   post:
 *     summary: Create new actor (Admin only)
 *     tags: [Actors]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tom Cruise
 *               image_url:
 *                 type: string
 *                 example: https://abc.com/tom.jpg
 *     responses:
 *       201:
 *         description: Create actor successfully
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
 *                   example: Create actor successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     actor:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         name:
 *                           type: string
 *                           example: Tom Cruise
 *                         image_url:
 *                           type: string
 *                           example: https://abc.com/tom.jpg
 *       400:
 *         description: Validation error
 *       409:
 *         description: Actor already exists
 */
router.post("/", authToken, isAdmin, createActor);


/**
 * @swagger
 * /actors:
 *   get:
 *     summary: Get all actors (Pagination + Search)
 *     tags: [Actors]
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
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         example: tom
 *     responses:
 *       200:
 *         description: Get all actors successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     pageNo:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 50
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           image_url:
 *                             type: string
 */
router.get("/", getAllActors);


/**
 * @swagger
 * /actors/{id}:
 *   get:
 *     summary: Get actor by id
 *     tags: [Actors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Get actor successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     actor:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         image_url:
 *                           type: string
 *       404:
 *         description: Actor not found
 */
router.get("/:id", getActorById);


/**
 * @swagger
 * /actors/{id}:
 *   put:
 *     summary: Update actor (Admin only)
 *     tags: [Actors]
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
 *                 example: Leonardo DiCaprio
 *               image_url:
 *                 type: string
 *                 example: https://abc.com/leo.jpg
 *     responses:
 *       200:
 *         description: Update actor successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     actor:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         image_url:
 *                           type: string
 *       404:
 *         description: Actor not found
 *       409:
 *         description: Actor name already exists
 */
router.put("/:id", authToken, isAdmin, updateActor);


/**
 * @swagger
 * /actors/{id}:
 *   delete:
 *     summary: Delete actor (Admin only)
 *     tags: [Actors]
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
 *         description: Delete actor successfully
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
 *                   example: Delete actor successfully
 *       404:
 *         description: Actor not found
 */
router.delete("/:id", authToken, isAdmin, deleteActor);


module.exports = router;