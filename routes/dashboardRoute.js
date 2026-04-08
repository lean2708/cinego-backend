const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authToken } = require('../middlewares/authToken');

const router = express.Router();

// Apply authentication middleware to all dashboard routes
router.use(authToken);

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get all dashboard data at once (recommended for initial load)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for statistics (default current year)
 *         example: 2026
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRevenue:
 *                           type: number
 *                           example: 1200000
 *                         ticketRevenue:
 *                           type: number
 *                           example: 900000
 *                         foodRevenue:
 *                           type: number
 *                           example: 300000
 *                         totalTicketsSold:
 *                           type: integer
 *                           example: 500
 *                         newUsers:
 *                           type: integer
 *                           example: 150
 *                     monthlyChart:
 *                       type: object
 *                       properties:
 *                         months:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["T1", "T2", "T3"]
 *                         revenue:
 *                           type: array
 *                           items:
 *                             type: number
 *                           example: [100000, 120000, 110000]
 *                     latestBookings:
 *                       type: array
 *                       items:
 *                         type: object
 *                     topMovies:
 *                       type: array
 *                       items:
 *                         type: object
 *                     topCinemas:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/', dashboardController.getDashboardData);

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get summary statistics (revenue, tickets, users, yearly change %)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for statistics (default current year)
 *         example: 2026
 *     responses:
 *       200:
 *         description: Summary statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                       example: 1200000
 *                     ticketRevenue:
 *                       type: number
 *                       example: 900000
 *                     foodRevenue:
 *                       type: number
 *                       example: 300000
 *                     totalTicketsSold:
 *                       type: integer
 *                       example: 500
 *                     newUsers:
 *                       type: integer
 *                       example: 150
 *                     changes:
 *                       type: object
 *                       properties:
 *                         ticketRevenue:
 *                           type: string
 *                           example: "+13.50%"
 */
// Summary statistics
router.get('/summary', dashboardController.getSummaryStats);

/**
 * @swagger
 * /dashboard/monthly-revenue:
 *   get:
 *     summary: Get monthly revenue chart data for 12 months
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for statistics (default current year)
 *         example: 2026
 *     responses:
 *       200:
 *         description: Monthly revenue data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     months:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"]
 *                     revenue:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [100000, 120000, 110000, 130000, 125000, 140000, 150000, 145000, 135000, 125000, 120000, 115000]
 *                     total:
 *                       type: number
 *                       example: 1518000
 */
// Monthly revenue chart data
router.get('/monthly-revenue', dashboardController.getMonthlyRevenueChart);

/**
 * @swagger
 * /dashboard/latest-bookings:
 *   get:
 *     summary: Get latest successful bookings (default 10)
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of bookings (default 10, max 100)
 *         example: 10
 *     responses:
 *       200:
 *         description: Latest bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ticketId:
 *                         type: string
 *                         example: "#TK-1234"
 *                       bookingCode:
 *                         type: string
 *                         example: "BK20260408001"
 *                       customerName:
 *                         type: string
 *                         example: "Nguyễn Văn A"
 *                       movieTitle:
 *                         type: string
 *                         example: "Dune: Part Two"
 *                       time:
 *                         type: string
 *                         example: "14:30"
 *                       date:
 *                         type: string
 *                         example: "8/4/2026"
 *                       status:
 *                         type: string
 *                         example: "Thành công"
 */
// Latest bookings
router.get('/latest-bookings', dashboardController.getLatestBookings);

/**
 * @swagger
 * /dashboard/top-movies:
 *   get:
 *     summary: Get top grossing movies by ticket revenue
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for statistics (default current year)
 *         example: 2026
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of movies (default 5, max 20)
 *         example: 5
 *     responses:
 *       200:
 *         description: Top movies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: integer
 *                         example: 1
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Dune: Part Two"
 *                       poster:
 *                         type: string
 *                         nullable: true
 *                       revenue:
 *                         type: number
 *                         example: 450000
 *                       ticketsSold:
 *                         type: integer
 *                         example: 200
 */
// Top grossing movies
router.get('/top-movies', dashboardController.getTopGrossingMovies);

/**
 * @swagger
 * /dashboard/top-cinemas:
 *   get:
 *     summary: Get top cinemas by number of bookings
 *     tags: [Dashboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for statistics (default current year)
 *         example: 2026
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of cinemas (default 5, max 20)
 *         example: 5
 *     responses:
 *       200:
 *         description: Top cinemas retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: integer
 *                         example: 1
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "CGV Vincom Hà Nội"
 *                       logo:
 *                         type: string
 *                         nullable: true
 *                       totalBookings:
 *                         type: integer
 *                         example: 1200
 *                       totalRevenue:
 *                         type: number
 *                         example: 950000
 */
// Top cinemas by bookings
router.get('/top-cinemas', dashboardController.getTopCinemasByBookings);

module.exports = router;
