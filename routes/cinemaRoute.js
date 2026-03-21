const express = require('express');
const {
    addCinema,
    updateCinema,
    deleteCinema,
    getCinemasForUser,
    getCinemasForAdmin,
    getCinemaById,
    getRoomsByCinema
} = require('../controllers/cinemaController');
const { authToken, isAdmin } = require('../middlewares/authToken');
const router = express.Router();
/**
 * @swagger
 * /cinemas:
 *   post:
 *     summary: Create a new cinema (Admin only)
 *     tags: [Cinemas]
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
 *               - address
 *               - province_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: CGV Vincom
 *               address:
 *                 type: string
 *                 example: 123 Nguyễn Huệ, Phường 1, TP.HCM
 *               province_id:
 *                 type: integer
 *                 example: 1
 *               image_urls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - https://example.com/1.jpg
 *                   - https://example.com/2.jpg
 *     responses:
 *       201:
 *         description: Cinema created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authToken, isAdmin, addCinema);

/**
 * @swagger
 * /cinemas/{id}:
 *   patch:
 *     summary: Update cinema (Admin only)
 *     tags: [Cinemas]
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
 *               address:
 *                 type: string
 *               province_id:
 *                 type: integer
 *               image_urls:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cinema updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Cinema not found
 */
router.patch('/:id', authToken, isAdmin, updateCinema);

/**
 * @swagger
 * /cinemas/{id}:
 *   delete:
 *     summary: Soft delete cinema (Admin only)
 *     tags: [Cinemas]
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
 *         description: Cinema deleted successfully
 *       404:
 *         description: Cinema not found
 */
router.delete('/:id', authToken, isAdmin, deleteCinema);

/**
 * @swagger
 * /cinemas/admin:
 *   get:
 *     summary: Retrieve all cinemas for Admin (including soft-deleted)
 *     tags: [Cinemas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: province_id
 *         schema:
 *           type: integer
 *         description: Filter by province
 *     responses:
 *       200:
 *         description: Get cinemas for admin successfully
 */
router.get('/admin', authToken, isAdmin, getCinemasForAdmin);

/**
 * @swagger
 * /cinemas:
 *   get:
 *     summary: Retrieve cinemas for User (only active)
 *     tags: [Cinemas]
 *     parameters:
 *       - in: query
 *         name: province_id
 *         schema:
 *           type: integer
 *         description: Filter by province
 *     responses:
 *       200:
 *         description: Get cinemas successfully
 */
router.get('/', getCinemasForUser);


/**
 * @swagger
 * /cinemas/{cinema_id}/rooms:
 *   get:
 *     summary: Get list rooms of a cinema
 *     tags: [Cinemas]
 *     parameters:
 *       - in: path
 *         name: cinema_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Get rooms successfully
 *       404:
 *         description: Cinema not found
 */
router.get('/:cinema_id/rooms', getRoomsByCinema);

/**
 * @swagger
 * /cinemas/{id}:
 *   get:
 *     summary: Get cinema by id
 *     tags: [Cinemas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Get cinema successfully
 *       404:
 *         description: Cinema not found
 */
router.get('/:id', getCinemaById);

module.exports = router;
