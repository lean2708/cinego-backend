const { getMyBookingHistory, getOrderDetailById } = require("../controllers/orderController");
const { authToken } = require("../middlewares/authToken");
const express = require("express");


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order / Booking APIs
 */

/**
 * @swagger
 * /orders/my-history:
 *   get:
 *     summary: Get my booking history
 *     tags: [Orders]
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
 *         description: Get booking history successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               pageNo: 1
 *               pageSize: 10
 *               totalItems: 2
 *               totalPages: 1
 *               data:
 *                 - order_id: 1
 *                   booking_code: "ABC123"
 *                   total_amount: 200000
 *                   payment_status: "SUCCESS"
 *                   tickets:
 *                     - movie_name: "Avengers"
 *                       genres: ["Action", "Sci-Fi"]
 *                       duration: 120
 *                       showtime: "2026-03-21T10:00:00Z"
 *                       seat: "A5"
 *                       ticket_code: "QR123"
 *                       room: "Room 1"
 *                       cinema: "CGV Vincom"
 *       401:
 *         description: Unauthorized
 */
router.get('/my-history', authToken, getMyBookingHistory);


/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order detail by ID
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: Get order detail successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Get order detail successfully"
 *               data:
 *                 order_id: 12
 *                 booking_code: "BK20260322001"
 *                 payment_status: "SUCCESS"
 *                 movie_name: "Avengers: Endgame"
 *                 genres: ["Action", "Sci-Fi"]
 *                 duration: 181
 *                 poster: "https://cdn.example.com/poster.jpg"
 *                 showtime: "2026-03-22T14:00:00.000Z"
 *                 room: "Room 3"
 *                 cinema: "CGV Vincom"
 *                 seats: ["A5", "A6", "A7"]
 *                 ticket_codes: ["QR123", "QR124", "QR125"]
 *                 ticket_prices: [80000, 80000, 80000]
 *                 ticket_quantity: 3
 *                 ticket_total: 240000
 *                 foods:
 *                   - name: "Popcorn"
 *                     image: "https://cdn.example.com/popcorn.jpg"
 *                     quantity: 2
 *                     price: 50000
 *                     total: 100000
 *                 food_total: 100000
 *                 voucher:
 *                   code: "SALE50"
 *                   value: 50
 *                   type: "PERCENT"
 *                 discount: 50000
 *                 total_amount: 290000
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:id", authToken, getOrderDetailById);


module.exports = router;