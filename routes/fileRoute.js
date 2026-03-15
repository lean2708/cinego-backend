const express = require('express');
const { uploadImage, uploadVideo } = require('../controllers/fileController');
const { authToken } = require('../middlewares/authToken');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

const MAX_IMAGES = parseInt(process.env.MAX_IMAGE_UPLOAD) || 10;
const MAX_VIDEOS = parseInt(process.env.MAX_VIDEO_UPLOAD) || 5;

/**
 * @swagger
 * tags:
 *   - name: Files
 *     description: File upload management
 */

/**
 * @swagger
 * /files/upload/image:
 *   post:
 *     summary: Upload one or multiple images
 *     tags: [Files]
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
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Images uploaded successfully
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
 *                     type: object
 *       400:
 *         description: Bad Request
 */
router.post('/upload/image',authToken,upload.array('file', MAX_IMAGES),uploadImage);

/**
 * @swagger
 * /files/upload/video:
 *   post:
 *     summary: Upload one or multiple videos
 *     tags: [Files]
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
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Videos uploaded successfully
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
 *                     type: object
 *       400:
 *         description: Bad Request
 */
router.post('/upload/video',authToken,upload.array('file', MAX_VIDEOS),uploadVideo);

module.exports = router;