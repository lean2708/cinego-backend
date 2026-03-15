const express = require("express");
const {
  createVoucher,
  getVoucherById,
  getAllVouchersForAdmin,
  getMyVouchers,
  updateVoucher,
  deleteVoucher,
  checkVoucher
} = require("../controllers/voucherController");

const { authToken, isAdmin } = require("../middlewares/authToken");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Vouchers
 *   description: Voucher management APIs
 */


/**
 * @swagger
 * /vouchers:
 *   post:
 *     summary: Create new voucher (Admin only)
 *     tags: [Vouchers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - value
 *               - type
 *               - start_date
 *               - end_date
 *             properties:
 *               code:
 *                 type: string
 *                 example: SALE50
 *               value:
 *                 type: integer
 *                 example: 50
 *               type:
 *                 type: string
 *                 enum: [PERCENT, CASH]
 *                 example: PERCENT
 *               start_date:
 *                 type: string
 *                 example: 2026-01-01
 *               end_date:
 *                 type: string
 *                 example: 2026-12-31
 *               usage_limit:
 *                 type: integer
 *                 example: 100
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Create voucher successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Voucher code already exists
 */
router.post("/", authToken, isAdmin, createVoucher);



/**
 * @swagger
 * /vouchers/check:
 *   post:
 *     summary: Check voucher discount amount
 *     tags: [Vouchers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - total_amount
 *             properties:
 *               code:
 *                 type: string
 *                 example: SALE50
 *               total_amount:
 *                 type: number
 *                 example: 200000
 *     responses:
 *       200:
 *         description: Voucher is valid
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
 *                     voucher_id:
 *                       type: integer
 *                     code:
 *                       type: string
 *                     discount_amount:
 *                       type: number
 *                     original_amount:
 *                       type: number
 *       400:
 *         description: Voucher invalid, expired, or usage limit reached
 *       404:
 *         description: Voucher not found
 */
router.post("/check", authToken, checkVoucher);



/**
 * @swagger
 * /vouchers/my-vouchers:
 *   get:
 *     summary: Get all vouchers with usage status for current user
 *     tags: [Vouchers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Get my vouchers successfully
 */
router.get("/my-vouchers", authToken, getMyVouchers);



/**
 * @swagger
 * /vouchers:
 *   get:
 *     summary: Get all vouchers (Admin)
 *     tags: [Vouchers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Get all vouchers successfully
 */
router.get("/", authToken, isAdmin, getAllVouchersForAdmin);



/**
 * @swagger
 * /vouchers/{id}:
 *   get:
 *     summary: Get voucher by id
 *     tags: [Vouchers]
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
 *         description: Get voucher successfully
 *       404:
 *         description: Voucher not found
 */
router.get("/:id", authToken, getVoucherById);



/**
 * @swagger
 * /vouchers/{id}:
 *   put:
 *     summary: Update voucher (Admin)
 *     tags: [Vouchers]
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
 *               code:
 *                 type: string
 *               value:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [PERCENT, CASH]
 *               start_date:
 *                 type: string
 *               end_date:
 *                 type: string
 *               usage_limit:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Update voucher successfully
 *       404:
 *         description: Voucher not found
 */
router.put("/:id", authToken, isAdmin, updateVoucher);



/**
 * @swagger
 * /vouchers/{id}:
 *   delete:
 *     summary: Soft delete voucher (Admin)
 *     tags: [Vouchers]
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
 *         description: Delete voucher successfully
 *       404:
 *         description: Voucher not found
 */
router.delete("/:id", authToken, isAdmin, deleteVoucher);

module.exports = router;