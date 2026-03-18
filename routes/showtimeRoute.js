const express = require("express");
const {
	createShowtime,
	updateShowtime,
	deleteShowtime,
	getShowtimesByMovieCinemaDate
} = require("../controllers/showtimeController");
const { isAdmin, authToken } = require("../middlewares/authToken");
const router = express.Router();


/**
 * @swagger
 * /showtimes:
 *   post:
 *     summary: Create showtime (Admin only)
 *     description: start_times có thể là một datetime (YYYY-MM-DDTHH:mm:ss) hoặc một danh sách các datetime
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
 *                 type: array
 *                 description: Danh sách thời gian bắt đầu suất chiếu (bắt buộc là mảng, mỗi phần tử là datetime ISO 8601)
 *                 items:
 *                   type: string
 *                   format: date-time
 *                 example:
 *                   - "2026-03-20T07:00:00"
 *                   - "2026-03-20T10:00:00"
 *                   - "2026-03-21T09:30:00"
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
 * /showtimes/{id}:
 *   put:
 *     summary: Update showtime (Admin only)
 *     tags: [Showtimes]
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
 *               movie_id:
 *                 type: integer
 *                 example: 1
 *               room_id:
 *                 type: integer
 *                 example: 2
 *               start_time:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-20T09:00:00"
 *               base_price:
 *                 type: number
 *                 example: 95000
 *     responses:
 *       200:
 *         description: Update showtime successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Showtime, movie or room not found
 *       409:
 *         description: Showtime conflict
 */
router.put("/:id", authToken, isAdmin, updateShowtime);



/**
 * @swagger
 * /showtimes/{id}:
 *   delete:
 *     summary: Delete showtime (Admin only)
 *     tags: [Showtimes]
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
 *         description: Delete showtime successfully
 *       400:
 *         description: Invalid showtime id
 *       404:
 *         description: Showtime not found
 */
router.delete("/:id", authToken, isAdmin, deleteShowtime);



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