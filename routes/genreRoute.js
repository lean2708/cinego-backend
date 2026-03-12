const express = require('express');
const {
    addGenre,
    updateGenre,
    deleteGenre,
    getAllForUser,
    getAllForAdmin,
    getGenreById
} = require('../controllers/genreController');
const { authToken, isAdmin } = require('../middlewares/authToken');
const router = express.Router();

/**
 * @swagger
 * /genres:
 *   post:
 *     summary: Create a new genre (Admin only)
 *     tags: [Genres]
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
 *                 example: Hành động
 *     responses:
 *       201:
 *         description: Genre created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authToken, isAdmin, addGenre);

/**
 * @swagger
 * /genres/{id}:
 *   patch:
 *     summary: Update genre (Admin only)
 *     tags: [Genres]
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
 *                 example: Viễn tưởng
 *     responses:
 *       200:
 *         description: Genre updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Genre not found
 */
router.patch('/:id', authToken, isAdmin, updateGenre);

/**
 * @swagger
 * /genres/{id}:
 *   delete:
 *     summary: Soft delete genre (Admin only)
 *     tags: [Genres]
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
 *         description: Genre deleted successfully
 *       404:
 *         description: Genre not found
 */
router.delete('/:id', authToken, isAdmin, deleteGenre);

/**
 * @swagger
 * /genres/admin:
 *   get:
 *     summary: Retrieve all genres for Admin (including soft-deleted)
 *     tags: [Genres]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Get genres for admin successfully
 */
router.get('/admin', authToken, isAdmin, getAllForAdmin);

/**
 * @swagger
 * /genres:
 *   get:
 *     summary: Retrieve genres for User (only active)
 *     tags: [Genres]
 *     responses:
 *       200:
 *         description: Get genres successfully
 */
router.get('/', getAllForUser);

/**
 * @swagger
 * /genres/{id}:
 *   get:
 *     summary: Get genre by id
 *     tags: [Genres]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Get genre successfully
 *       404:
 *         description: Genre not found
 */
router.get('/:id', getGenreById);

module.exports = router;