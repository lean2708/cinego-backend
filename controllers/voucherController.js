const Voucher = require("../models/Voucher");
const AppError = require("../utils/appError");

const createVoucher = async (req, res, next) => {
  try {

    console.log("Received request to create voucher");

    const {code, value, type, start_date, end_date, usage_limit, is_active} = req.body;

    if (!code || !value || !type || !start_date || !end_date) {
      throw new AppError(400, "Please provide full voucher information");
    }

    const existing = await Voucher.findOne({
      where: { code }
    });

    if (existing) {
      throw new AppError(409, "Voucher code already exists");
    }

    const voucher = await Voucher.create({
      code,
      value,
      type,
      start_date,
      end_date,
      usage_limit,
      is_active: is_active ?? true
    });

    console.log("Create voucher:", voucher.id, "successfully");

    return res.status(201).json({
      success: true,
      message: "Create voucher successfully",
      data: { voucher }
    });

  } catch (error) {
    next(error);
  }
};



const getVoucherById = async (req, res, next) => {
  try {

    const voucherId = req.params.id;

    console.log("Received request get voucher by id:", voucherId);

    const voucher = await Voucher.findOne({
      where: {
        id: voucherId
      }
    });

    if (!voucher) {
      throw new AppError(404, "Voucher not found");
    }

    console.log("Get voucher:", voucherId, "successfully");

    return res.status(200).json({
      success: true,
      message: "Get voucher successfully",
      data: { voucher }
    });

  } catch (error) {
    next(error);
  }
};


const getAllVouchersForAdmin = async (req, res, next) => {
  try {

    const pageNo = parseInt(req.query.pageNo) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (pageNo - 1) * pageSize;

    console.log("Received request get all vouchers for Admin pageNo:", pageNo, "pageSize:", pageSize);

    const { count, rows } = await Voucher.findAndCountAll({
      limit: pageSize,
      offset : offset,
      order: [["created_at", "DESC"]]
    });

    console.log("Get all vouchers successfully");

    return res.status(200).json({
      success: true,
      message: "Get all vouchers for admin successfully",
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



const updateVoucher = async (req, res, next) => {
  try {
    const voucherId = req.params.id;

    console.log("Received request update voucher:", voucherId);

    const voucher = await Voucher.findByPk(voucherId);

    if (!voucher || voucher.is_deleted) {
      throw new AppError(404, "Voucher not found");
    }

    const {code, value, type, start_date, end_date, usage_limit, is_active} = req.body;

    voucher.code = code ?? voucher.code;
    voucher.value = value ?? voucher.value;
    voucher.type = type ?? voucher.type;
    voucher.start_date = start_date ?? voucher.start_date;
    voucher.end_date = end_date ?? voucher.end_date;
    voucher.usage_limit = usage_limit ?? voucher.usage_limit;
    voucher.is_active = is_active ?? voucher.is_active;

    await voucher.save();

    console.log("Update voucher:", voucherId, "successfully");

    return res.status(200).json({
      success: true,
      message: "Update voucher successfully",
      data: { voucher }
    });

  } catch (error) {
    next(error);
  }
};


const deleteVoucher = async (req, res, next) => {
  try {

    const voucherId = req.params.id;

    console.log("Received request delete voucher:", voucherId);

    const voucher = await Voucher.findByPk(voucherId);

    if (!voucher) {
      throw new AppError(404, "Voucher not found");
    }

    await voucher.update({
      is_deleted: true
    });

    console.log("Soft delete voucher:", voucherId, "successfully");

    return res.status(200).json({
      success: true,
      message: "Delete voucher successfully"
    });

  } catch (error) {
    next(error);
  }
};


module.exports = {
  createVoucher,
  getVoucherById,
  getAllVouchersForAdmin,
  updateVoucher,
  deleteVoucher
};