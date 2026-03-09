const Contact = require("../models/Contact");
const AppError = require("../utils/appError");
const { sendContactReplyEmail } = require("../utils/sendEmail");



const createContact = async (req, res, next) => {
    try {

        const { senderName, email, subject, message } = req.body;

        console.log("Received request to create contact");

        if (!senderName || !email || !subject || !message) {
            throw new AppError(400, "Please provide senderName, email, subject, message");
        }

        const newContact = await Contact.create({
            senderName,
            email,
            subject,
            message
        });

        console.log("Create contact successfully:", newContact.id);

        return res.status(201).json({
            success: true,
            message: "Contact sent successfully",
            data: {
                contact: newContact
            }
        });

    } catch (error) {
        next(error);
    }
};



// ADMIN xem contact theo id
const getContactById = async (req, res, next) => {
    try {
        console.log("Received request to get Contact By Id:", req.params.id);

        const contact = await Contact.findByPk(req.params.id);

        if (!contact) {
            throw new AppError(404, "Contact not found");
        }

        console.log("Contact retrieved successfully", req.params.id);

        return res.status(200).json({
            success: true,
            message: "Get contact successfully",
            data: {
                contact
            }
        });

    } catch (error) {
        next(error);
    }
};



// ADMIN xem danh sách contact
const getAllContacts = async (req, res, next) => {
    try {

        const pageNo = parseInt(req.query.pageNo) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (pageNo - 1) * pageSize;

        console.log("Received request get all users with pageNo: " + pageNo + " pageSize:" + pageSize );

        const { count, rows } = await Contact.findAndCountAll({
            limit: pageSize,
            offset: offset,
            order: [["createdAt", "DESC"]]
        });

        console.log("Get all contact with pageNo:" + pageNo + " pageSize:" + pageSize + " successfully");

        return res.status(200).json({
            success: true,
            message: "Get contacts successfully",
            data: {
                pageNo,
                pageSize,
                totalPages: Math.ceil(count / pageSize),
                totalItems: count,
                items: rows
            }
        });

    } catch (error) {
        next(error);
    }
};



// ADMIN phản hồi contact
const replyContact = async (req, res, next) => {
  try {

    const contactId = req.params.id;
    const { replyMessage } = req.body;

    const admin = req.user;

    console.log("Received request to get Contact By Id:", req.params.id);

    console.log("Admin replying contact:", admin.id);

    const contact = await Contact.findByPk(contactId);

    if (!contact) {
      throw new AppError(404, "Contact not found");
    }

    if (!replyMessage) {
      throw new AppError(400, "Reply message is required");
    }

    await sendContactReplyEmail(contact.email, contact.senderName, replyMessage);

    contact.status = "PROCESSING";
    contact.repliedBy = admin.id;

    await contact.save();

    console.log(`Contact replied successfully | contactId: ${contactId}`);

    return res.status(200).json({
      success: true,
      message: "Reply contact successfully",
      data: {
        contact
      }
    });

  } catch (error) {
    next(error);
  }
};



const resolveContact = async (req, res, next) => {
    try {

        const contactId = req.params.id;

        console.log("Received request to resolve contact:", contactId);

        const contact = await Contact.findByPk(contactId);

        if (!contact) {
            throw new AppError(404, "Contact not found");
        }

        contact.status = "RESOLVED";

        await contact.save();

        console.log(`Contact resolved successfully | contactId: ${contactId}`);

        return res.status(200).json({
            success: true,
            message: "Contact resolved successfully",
            data: {
                contact
            }
        });

    } catch (error) {
        next(error);
    }
};



// ADMIN xoá contact
const deleteContact = async (req, res, next) => {
    try {

        const contactId = req.params.id;

        console.log("Received request to soft delete contact:", contactId);

        const contact = await Contact.findByPk(contactId);

        if (!contact) {
            throw new AppError(404, "Contact not found");
        }

        contact.is_deleted = true;

        await contact.save();

        console.log("Soft delete contact:", contactId, " successfully");

        return res.status(200).json({
            success: true,
            message: "Delete contact successfully"
        });

    } catch (error) {
        next(error);
    }
};



module.exports = {
    createContact,
    getContactById,
    getAllContacts,
    replyContact,
    resolveContact,
    deleteContact
};