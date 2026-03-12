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
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProvinceInput'
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
 *                   $ref: '#/components/schemas/Province'
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
 *   patch:
 *     tags:
 *       - Provinces
 *     summary: Update a province
 *     security:
 *       - bearerAuth: []
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
 *             $ref: '#/components/schemas/ProvinceInput'
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
 *                   $ref: '#/components/schemas/Province'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 */
router.patch("/:id", authToken, isAdmin, updateProvince);

/**
 * @swagger
 * /provinces/{id}:
 *   delete:
 *     tags:
 *       - Provinces
 *     summary: Soft-delete a province
 *     security:
 *       - bearerAuth: []
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
 *                     $ref: '#/components/schemas/Province'
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
 *       - bearerAuth: []
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
 *                     $ref: '#/components/schemas/Province'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/admin", authToken, isAdmin, getAllProvincesForAdmin);

module.exports = router;