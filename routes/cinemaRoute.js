const express = require('express');
const {
    addCinema,
    updateCinema,
    deleteCinema,
    getAllCinemas,
    getCinemaById
} = require('../controllers/cinemaController');
const { authToken, isAdmin } = require('../middlewares/authToken');
const router = express.Router();

/**
 * @swagger
 * /cinemas:
 *   post:
 *     tags:
 *       - Cinemas
 *     summary: Create a new cinema
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CinemaInput'
 *     responses:
 *       201:
 *         description: Created
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
 *                   $ref: '#/components/schemas/Cinema'
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authToken, isAdmin, addCinema);

/**
 * @swagger
 * /cinemas/{id}:
 *   patch:
 *     tags:
 *       - Cinemas
 *     summary: Update a cinema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CinemaInput'
 *     responses:
 *       200:
 *         description: Updated
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
 *                   $ref: '#/components/schemas/Cinema'
 *       404:
 *         description: Not Found
 */
router.patch('/:id', authToken, isAdmin, updateCinema);

/**
 * @swagger
 * /cinemas/{id}:
 *   delete:
 *     tags:
 *       - Cinemas
 *     summary: Soft-delete a cinema
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted (soft)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       404:
 *         description: Not Found
 */
router.delete('/:id', authToken, isAdmin, deleteCinema);

/**
 * @swagger
 * /cinemas:
 *   get:
 *     tags:
 *       - Cinemas
 *     summary: Retrieve all cinemas (not deleted)
 *     parameters:
 *       - in: query
 *         name: province_id
 *         schema:
 *           type: integer
 *         description: Filter by province
 *     responses:
 *       200:
 *         description: A list of cinemas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Cinema'
 */
router.get('/', getAllCinemas);

/**
 * @swagger
 * /cinemas/{id}:
 *   get:
 *     tags:
 *       - Cinemas
 *     summary: Get cinema by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cinema detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Cinema'
 *       404:
 *         description: Not Found
 */
router.get('/:id', getCinemaById);

module.exports = router;
