const express = require("express");
const {
    createContact,
    getContactById,
    getAllContacts,
    replyContact,
    resolveContact,
    deleteContact
} = require("../controllers/contactController");

const { authToken, isAdmin } = require("../middlewares/authToken");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: Contact support APIs
 */


/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: User gửi contact
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderName
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               senderName:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               subject:
 *                 type: string
 *                 example: Lỗi thanh toán
 *               message:
 *                 type: string
 *                 example: Tôi không thể thanh toán vé
 *     responses:
 *       201:
 *         description: Contact sent successfully
 */
router.post("/", createContact);



/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Get all contacts (Admin)
 *     tags: [Contacts]
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
 *         description: Get contacts successfully
 */
router.get("/", authToken, isAdmin, getAllContacts);



/**
 * @swagger
 * /contacts/{id}:
 *   get:
 *     summary: Get contact by id (Admin)
 *     tags: [Contacts]
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
 *         description: Get contact successfully
 *       404:
 *         description: Contact not found
 */
router.get("/:id", authToken, isAdmin, getContactById);



/**
 * @swagger
 * /contacts/{id}/reply:
 *   put:
 *     summary: Admin reply contact (PROCESSING)
 *     tags: [Contacts]
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
 *             required:
 *               - replyMessage
 *             properties:
 *               replyMessage:
 *                 type: string
 *                 example: Vé của bạn đã được hoàn tiền
 *     responses:
 *       200:
 *         description: Reply contact successfully
 */
router.put("/:id/reply", authToken, isAdmin, replyContact);



/**
 * @swagger
 * /contacts/{id}/resolve:
 *   put:
 *     summary: Mark contact as resolved
 *     tags: [Contacts]
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
 *         description: Contact resolved successfully
 */
router.put("/:id/resolve", authToken, isAdmin, resolveContact);



/**
 * @swagger
 * /contacts/{id}:
 *   delete:
 *     summary: Soft delete contact
 *     tags: [Contacts]
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
 *         description: Delete contact successfully
 *       404:
 *         description: Contact not found
 */
router.delete("/:id", authToken, isAdmin, deleteContact);



module.exports = router;