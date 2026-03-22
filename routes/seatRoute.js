const express = require("express");
const router = express.Router();
const multer = require("multer");
const seatController = require("../controllers/seatController");
const { isAdmin, authToken } = require("../middlewares/authToken");
const upload = multer({ dest: "uploads/" });
/**
 * @swagger
 * /seats/import-excel:
 *   post:
 *     tags:
 *       - Seats
 *     summary: Import seats from an Excel file
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Seats imported successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/import-excel", 
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
 *     summary: Retrieve all seats
 *     parameters:
 *       - in: query
 *         name: room_id
 *         schema:
 *           type: integer
 *         description: Filter by room id
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [VIP, COUPLE, STANDARD]
 *         description: Filter by seat type
 *     responses:
 *       200:
 *         description: A list of seats
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
 *                     $ref: '#/components/schemas/Seat'
 *   post:
 *     tags:
 *       - Seats
 *     summary: Create a new seat
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Seat'
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Seat'
 *       404:
 *         description: Not Found
 *   put:
 *     tags:
 *       - Seats
 *     summary: Update a seat
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Seat'
 *       404:
 *         description: Not Found
 *   delete:
 *     tags:
 *       - Seats
 *     summary: Soft-delete a seat
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
 *         description: Deleted (soft)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *       404:
 *         description: Not Found
 */
router.route("/:id")
    .get(seatController.getSeatById)
    .put(authToken, isAdmin, seatController.updateSeatById)
    .delete(authToken, isAdmin, seatController.deleteSeatById);

module.exports = router;
