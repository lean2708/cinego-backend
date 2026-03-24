const { getMyBookingHistory, getOrderDetailById, checkInAllTickets, getAllOrders, getSystemCheckinHistory } = require("../controllers/orderController");
const { authToken, isAdmin } = require("../middlewares/authToken");
const express = require("express");


const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Orders
 *     description: Order / Booking APIs
 */



/**
 * @swagger
 * /orders/admin:
 *   get:
 *     summary: Get all orders in system (admin only, can filter by order_status)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: integer
 *         example: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         example: 10
 *         description: Number of items per page
 *       - in: query
 *         name: order_status
 *         schema:
 *           type: string
 *         description: Filter orders by payment status (SUCCESS, PENDING, FAILED)
 *     responses:
 *       200:
 *         description: List of all orders
 *       401:
 *         description: Unauthorized
 */
router.get("/admin", authToken, isAdmin, getAllOrders);


/**
 * @swagger
 * /orders/my-history:
 *   get:
 *     summary: Get my booking history (Ticket History) (can filter by payment_status)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: integer
 *         example: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         example: 10
 *         description: Number of items per page
 *       - in: query
 *         name: order_status
 *         schema:
 *           type: string
 *         example: "SUCCESS"
 *         description: Filter orders by payment status (SUCCESS, PENDING, FAILED)
 *     responses:
 *       200:
 *         description: Get booking history successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Get All Order History"
 *               data:
 *                 pageNo: 1
 *                 pageSize: 10
 *                 totalItems: 2
 *                 totalPages: 1
 *                 items:
 *                   - order_id: 1
 *                     booking_code: "ABC123"
 *                     total_amount: 200000
 *                     payment_status: "SUCCESS"
 *                     movie_name: "Avengers"
 *                     genres: ["Action", "Sci-Fi"]
 *                     duration: 120
 *                     poster: "https://cdn.example.com/poster.jpg"
 *                     showtime: "2026-03-21T10:00:00Z"
 *                     room: "Room 1"
 *                     cinema: "CGV Vincom"
 *                     seats: ["A5"]
 *                     ticket_codes: ["QR123"]
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid payment_status
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


/**
 * @swagger
 * /orders/check-in:
 *   post:
 *     summary: Check-in all tickets by booking_code (scan QR)
 *     tags: [Orders]
 *     description: Quét QR hoặc nhập booking_code để check-in toàn bộ vé trong đơn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             booking_code: "BK20260322001"
 *     responses:
 *       200:
 *         description: Check-in success
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Checked-in 3 tickets"
 *       404:
 *         description: Order not found
 */
router.post("/check-in", checkInAllTickets);


/**
 * @swagger
 * /orders/checkin/history/all:
 *   get:
 *     summary: Get system check-in history (admin only, can filter by ticket_status)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: integer
 *         example: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         example: 10
 *         description: Number of items per page
 *       - in: query
 *         name: ticket_status
 *         schema:
 *           type: string
 *           enum: [PENDING, CHECKED_IN, EXPIRED]
 *         description: Filter tickets by status
 *     responses:
 *       200:
 *         description: Get system check-in history successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/checkin/history/all', authToken, isAdmin, getSystemCheckinHistory);

module.exports = router;