const express = require("express");
const router = express.Router();
const multer = require("multer");
const seatController = require("../controllers/seatController");
const { isAdmin, authToken } = require("../middlewares/authToken");

const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * tags:
 *   - name: Seats
 *     description: Seat management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Seat:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         room_id:
 *           type: integer
 *         row_label:
 *           type: string
 *           example: "A"
 *         number:
 *           type: integer
 *           example: 10
 *         type:
 *           type: string
 *           enum: [standard, vip, couple]
 *           example: standard
 *         is_deleted:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *
 *     SeatInput:
 *       type: object
 *       required:
 *         - room_id
 *         - row_label
 *         - number
 *       properties:
 *         room_id:
 *           type: integer
 *           example: 1
 *         row_label:
 *           type: string
 *           example: "A"
 *         number:
 *           type: integer
 *           example: 10
 *         type:
 *           type: string
 *           enum: [standard, vip, couple]
 *           default: standard
 */

/**
 * @swagger
 * /seats/showtime/{showtime_id}/map:
 *   get:
 *     tags:
 *       - Seats
 *     summary: Get seat map for a showtime
 *     parameters:
 *       - in: path
 *         name: showtime_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seat map
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         number:
 *                           type: integer
 *                         type:
 *                           type: string
 *                         status:
 *                           type: string
 *                           enum: [AVAILABLE, HOLDING, BOOKED]
 */
router.get("/showtime/:showtime_id/map", seatController.getSeatMapByShowtime);

/**
 * @swagger
 * /seats/import-excel:
 *   post:
 *     tags:
 *       - Seats
 *     summary: Import seats from Excel
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Import success
 */
router.post(
  "/import-excel",
  authToken,
  isAdmin,
  upload.single("file"),
  seatController.importSeatsFromExcel
);

/**
 * @swagger
 * /seats:
 *   get:
 *     tags:
 *       - Seats
 *     summary: Get all seats
 *     parameters:
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [standard, vip, couple]
 *     responses:
 *       200:
 *         description: List seats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Seat'
 *
 *   post:
 *     tags:
 *       - Seats
 *     summary: Create new seat
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SeatInput'
 *     responses:
 *       201:
 *         description: Created
 */
router.route("/")
  .get(seatController.getAllSeats)
  .post(authToken, isAdmin, seatController.createSeat);

/**
 * @swagger
 * /seats/{id}:
 *   get:
 *     tags:
 *       - Seats
 *     summary: Get seat by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seat detail
 *
 *   put:
 *     tags:
 *       - Seats
 *     summary: Update seat
 *     security:
 *       - BearerAuth: []
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
 *             $ref: '#/components/schemas/SeatInput'
 *     responses:
 *       200:
 *         description: Updated
 *
 *   delete:
 *     tags:
 *       - Seats
 *     summary: Soft delete seat
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.route("/:id")
  .get(seatController.getSeatById)
  .put(authToken, isAdmin, seatController.updateSeatById)
  .delete(authToken, isAdmin, seatController.deleteSeatById);

module.exports = router;