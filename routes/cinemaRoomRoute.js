/**
 * @openapi
 * /cinema-rooms:
 *   get:
 *     tags:
 *       - CinemaRoom
 *     summary: Get cinema rooms list (including deleted)
 *     description: Get all cinema rooms. You can filter by cinema_id.
 *     parameters:
 *       - in: query
 *         name: cinema_id
 *         schema:
 *           type: integer
 *         description: Filter by cinema ID
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: integer
 *         description: Page number (default 1)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: Items per page (default 10)
 *     responses:
 *       200:
 *         description: Cinema room list returned
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       cinema_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       is_deleted:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *
 *   post:
 *     tags:
 *       - CinemaRoom
 *     summary: Create a new cinema room
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cinema_id
 *               - name
 *             properties:
 *               cinema_id:
 *                 type: integer
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created successfully
 *
 * /cinema-rooms/{id}:
 *   get:
 *     tags:
 *       - CinemaRoom
 *     summary: Get cinema room by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Cinema room details
 *   put:
 *     tags:
 *       - CinemaRoom
 *     summary: Update cinema room
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
 *             type: object
 *             properties:
 *               cinema_id:
 *                 type: integer
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 *   delete:
 *     tags:
 *       - CinemaRoom
 *     summary: Soft delete cinema room
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
 *         description: Deleted successfully
 */
const express = require('express');
const { authToken, isAdmin } = require('../middlewares/authToken');
const {
  getCinemaRooms,
  getCinemaRoomById,
  addCinemaRoom,
  updateCinemaRoom,
  deleteCinemaRoom,
} = require('../controllers/cinemaRoomController');

const router = express.Router();

router.get('/', getCinemaRooms);
router.get('/:id', getCinemaRoomById);
router.post('/', authToken, isAdmin, addCinemaRoom);
router.put('/:id', authToken, isAdmin, updateCinemaRoom);
router.delete('/:id', authToken, isAdmin, deleteCinemaRoom);

module.exports = router;
