const express = require('express');
const {
    addProvince,
    updateProvince,
    deleteProvince,
    getAllProvinces,
    getAllProvincesForAdmin
} = require('../controllers/provinceController');
const {
    authToken,
    isAdmin
} = require('../middlewares/authToken');
const router = express.Router();
/**
 * @swagger
 * tags:
 *   - name: Provinces
 *     description: Operations related to provinces
 */


/**
 * @swagger
 * /provinces:
 *   post:
 *     tags:
 *       - Provinces
 *     summary: Create a new province
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Hanoi'
 *             required: [name]
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: 'Hanoi'
 *                     is_deleted:
 *                       type: boolean
 *                       example: false
 *                     updated_by:
 *                       type: integer
 *                       example: 1
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post("/", authToken, isAdmin, addProvince);

/**
 * @swagger
 * /provinces/{id}:
 *   put:
 *     tags:
 *       - Provinces
 *     summary: Update a province
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
 *               name:
 *                 type: string
 *                 example: 'Hanoi'
 *             required: [name]
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: 'Hanoi'
 *                     is_deleted:
 *                       type: boolean
 *                       example: false
 *                     updated_by:
 *                       type: integer
 *                       example: 1
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 */
router.put("/:id", authToken, isAdmin, updateProvince);

/**
 * @swagger
 * /provinces/{id}:
 *   delete:
 *     tags:
 *       - Provinces
 *     summary: Soft-delete a province
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
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 */
router.delete("/:id", authToken, isAdmin, deleteProvince);

/**
 * @swagger
 * /provinces:
 *   get:
 *     tags:
 *       - Provinces
 *     summary: Retrieve all provinces
 *     parameters:
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
 *         description: A list of provinces
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
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: 'Hanoi'
 *                       is_deleted:
 *                         type: boolean
 *                         example: false
 *                       updated_by:
 *                         type: integer
 *                         example: 1
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 */
router.get("/", getAllProvinces);
/**
 * @swagger
 * /provinces/admin:
 *   get:
 *     tags:
 *       - Provinces
 *     summary: Retrieve all provinces (admin)
 *     security:
 *       - BearerAuth: []
 *     parameters:
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
 *         description: A list of provinces
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
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: 'Hanoi'
 *                       is_deleted:
 *                         type: boolean
 *                         example: false
 *                       updated_by:
 *                         type: integer
 *                         example: 1
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/admin", authToken, isAdmin, getAllProvincesForAdmin);

module.exports = router;