const express = require('express');
const {
    createMovie,        
    updateMovie,
    deleteMovie,
    getAllMovies,      
    getAllMoviesForAdmin, 
    getMovieById
} = require('../controllers/movieController');
const { authToken, isAdmin } = require('../middlewares/authToken');
const router = express.Router();

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Create a new movie (Admin only)
 *     tags: [Movies]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - duration
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *                 example: Avenger Endgame
 *               duration:
 *                 type: integer
 *                 example: 180
 *               directors_name:
 *                 type: string
 *                 example: Anthony Russo, Joe Russo
 *               release_date:
 *                 type: string
 *                 format: date
 *                 example: "2019-04-26"
 *               description:
 *                 type: string
 *                 example: Phim siêu anh hùng chiếu rạp...
 *               poster_urls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/poster1.jpg"]
 *               trailer_url:
 *                 type: string
 *                 example: https://youtube.com/trailer
 *               status:
 *                 type: string
 *                 enum: [SHOWING, COMING_SOON, PASSED]
 *                 example: SHOWING
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: Movie created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authToken, isAdmin, createMovie);

/**
 * @swagger
 * /movies/{id}:
 *   patch:
 *     summary: Update movie (Admin only)
 *     tags: [Movies]
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
 *               title:
 *                 type: string
 *               duration:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [SHOWING, COMING_SOON, PASSED]
 *               genreIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Movie updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Movie not found
 */
router.patch('/:id', authToken, isAdmin, updateMovie);

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Soft delete movie (Admin only)
 *     tags: [Movies]
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
 *         description: Movie deleted successfully
 *       404:
 *         description: Movie not found
 */
router.delete('/:id', authToken, isAdmin, deleteMovie);

/**
 * @swagger
 * /movies/admin:
 *   get:
 *     summary: Retrieve all movies for Admin (including soft-deleted)
 *     tags: [Movies]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Get movies for admin successfully
 */
router.get('/admin', authToken, isAdmin, getAllMoviesForAdmin);

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Retrieve movies for User (only active)
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Get movies successfully
 */
router.get('/', getAllMovies);

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Get movie by id
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Get movie successfully
 *       404:
 *         description: Movie not found
 */
router.get('/:id', getMovieById);

module.exports = router;