const express = require("express");
const router = express.Router();

const { 
    getTicketDashboardToday,
    getTicketDashboardOverall
} = require("../controllers/ticketController");

const { authToken, isAdmin } = require("../middlewares/authToken");

/**
 * @swagger
 * tags:
 *   name: Ticket
 *   description: Ticket / Dashboard APIs
 */


/**
 * @swagger
 * /tickets/dashboard:
 *   get:
 *     summary: Get ticket dashboard in today (Admin)
 *     tags: [Ticket]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Get dashboard successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Get ticket dashboard today successfully"
 *               data:
 *                 date: "2026-03-25"
 *                 total_tickets_sold: 120
 *                 total_tickets_checked_in: 95
 *       401:
 *         description: Unauthorized
 */
router.get("/dashboard", authToken, isAdmin, getTicketDashboardToday);


/**
 * @swagger
 * /tickets/dashboard/overall:
 *   get:
 *     summary: Get ticket dashboard overall (week / month / year)
 *     tags: [Ticket]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [WEEK, MONTH, YEAR]
 *         example: MONTH
 *         description: 
 *           WEEK: số vé theo tuần trong tháng hiện tại  
 *           MONTH: số vé theo tháng trong năm hiện tại  
 *           YEAR: số vé theo từng năm
 *     responses:
 *       200:
 *         description: Get dashboard overall successfully
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Get ticket dashboard overall successfully"
 *               data:
 *                 type: "MONTH"
 *                 items:
 *                   - label: "2026-01-01"
 *                     total_tickets: 25555
 *                   - label: "2026-02-01"
 *                     total_tickets: 343353
 *                   - label: "2026-03-01"
 *                     total_tickets: 3554322
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Invalid type
 */
router.get("/dashboard/overall", authToken, isAdmin, getTicketDashboardOverall);


module.exports = router;