const express = require("express");
const { createShowtime, getShowtimesByMovieCinemaDate } = require("../controllers/showtimeController");
const { isAdmin, authToken } = require("../middlewares/authToken");
const router = express.Router();


/**
 * @swagger
 * /showtimes:
 *   post:
 *     summary: Create showtime (Admin only)
 *     tags: [Showtimes]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - movie_id
 *               - room_id
 *               - start_times
 *               - base_price
 *             properties:
 *               movie_id:
 *                 type: integer
 *                 example: 1
 *               room_id:
 *                 type: integer
 *                 example: 2
 *               base_price:
 *                 type: number
 *                 example: 90000
 *               start_times:
 *                 description: Có thể truyền 1 hoặc nhiều start_time
 *                 oneOf:
 *                   - type: string
 *                     format: date-time
 *                     example: "2026-03-20T07:00:00"
 *                   - type: array
 *                     items:
 *                       type: string
 *                       format: date-time
 *                     example:
 *                       - "2026-03-20T07:00:00"
 *                       - "2026-03-20T10:00:00"
 *                       - "2026-03-21T09:30:00"
 *     responses:
 *       201:
 *         description: Create showtime successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Movie or room not found
 *       409:
 *         description: Showtime conflict
 */

router.post("/", authToken, isAdmin, createShowtime);



/**
 * @swagger
 * /showtimes/filter:
 *   get:
 *     summary: Get showtimes by movie, cinema and date
 *     tags: [Showtimes]
 *     parameters:
 *       - in: query
 *         name: movie_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: cinema_id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: 2026-03-20
 *     responses:
 *       200:
 *         description: List showtimes
 */
router.get("/filter", getShowtimesByMovieCinemaDate);

module.exports = router;