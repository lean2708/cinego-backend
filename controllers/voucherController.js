const { Op } = require("sequelize");
const Voucher = require("../models/Voucher");
const UserVoucherUsage = require("../models/UserVoucherUsage");
const AppError = require("../utils/appError");

const createVoucher = async (req, res, next) => {
  try {

    console.log("Received request to create voucher");

    const {code, value, type, description, start_date, end_date, usage_limit, is_active} = req.body;

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
      description,
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


const getMyVouchers = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    console.log("Received request get my vouchers user_id:", userId);

    // 1. Lấy danh sách voucher chưa bị xóa
    const vouchers = await Voucher.findAll({
      where: { is_deleted: false },
      order: [["created_at", "DESC"]],
    });

    // 2. Xử lý từng voucher
    const items = await Promise.all(
      vouchers.map(async (voucher) => {

        const startDate = new Date(voucher.start_date);
        const endDate = new Date(voucher.end_date);

        // Kiểm tra voucher có nằm trong khoảng thời gian sử dụng không
        const isInTimeWindow = now >= startDate && now <= endDate;

        // Điều kiện query usage trong khoảng thời gian voucher
        const usageCondition = {
          voucher_id: voucher.id,
          used_at: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        };

        // 3. Đếm tổng số lần voucher đã được sử dụng
        const totalUsedInCurrentPeriod = await UserVoucherUsage.count({
          where: usageCondition,
        });

        // 4. Đếm số lần user hiện tại đã sử dụng voucher
        const myUsedInCurrentPeriod = await UserVoucherUsage.count({
          where: {
            ...usageCondition,
            user_id: userId,
          },
        });

        // 5. Kiểm tra giới hạn sử dụng
        const hasUsageLimit = voucher.usage_limit !== null;

        const isWithinUsageLimit =
          !hasUsageLimit ||
          totalUsedInCurrentPeriod < voucher.usage_limit;

        const remainingUsage = hasUsageLimit
          ? Math.max(voucher.usage_limit - totalUsedInCurrentPeriod, 0)
          : null;

        // 6. Kiểm tra user đã dùng voucher chưa
        const hasUsedByCurrentUser =
          myUsedInCurrentPeriod > 0;

        // 7. Kiểm tra user có thể sử dụng voucher không
        const canUse =
          voucher.is_active &&
          isInTimeWindow &&
          isWithinUsageLimit &&
          !hasUsedByCurrentUser;

        // 8. Xác định trạng thái voucher
        let status = "AVAILABLE";

        if (!voucher.is_active) {
          status = "INACTIVE";
        } else if (now < startDate) {
          status = "NOT_STARTED";
        } else if (now > endDate) {
          status = "EXPIRED";
        } else if (!isWithinUsageLimit) {
          status = "USAGE_LIMIT_REACHED";
        } else if (hasUsedByCurrentUser) {
          status = "ALREADY_USED_IN_CURRENT_PERIOD";
        }

        // 9. Trả dữ liệu voucher
        return {
          ...voucher.toJSON(),
          is_in_time_window: isInTimeWindow,
          total_used_in_current_period: totalUsedInCurrentPeriod,
          my_used_in_current_period: myUsedInCurrentPeriod,
          has_used_by_current_user_in_current_period: hasUsedByCurrentUser,
          remaining_usage: remainingUsage,
          can_use: canUse,
          status,
        };
      })
    );

    console.log("Get my vouchers user_id:", userId, "successfully");

    return res.status(200).json({
      success: true,
      message: "Get my vouchers successfully",
      data: { items },
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

    const {code, value, type, description, start_date, end_date, usage_limit, is_active} = req.body;

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


const checkVoucher = async (req, res, next) => {
  try {
    const { code, total_amount } = req.body;

    console.log("Received request check voucher code:", code, "total_amount:", total_amount);

    if (!code || total_amount === undefined || total_amount === null) {
      throw new AppError(400, "Please provide voucher code and total_amount");
    }

    const amount = parseFloat(total_amount);
    if (isNaN(amount) || amount < 0) {
      throw new AppError(400, "total_amount must be a non-negative number");
    }

    const voucher = await Voucher.findOne({
      where: { code, is_deleted: false }
    });

    if (!voucher) {
      throw new AppError(404, "Voucher not found");
    }

    if (!voucher.is_active) {
      throw new AppError(400, "Voucher is inactive");
    }

    const now = new Date();
    if (now < new Date(voucher.start_date) || now > new Date(voucher.end_date)) {
      throw new AppError(400, "Voucher is expired or not yet valid");
    }

    if (voucher.usage_limit !== null) {
      const usedCount = await UserVoucherUsage.count({
        where: { voucher_id: voucher.id }
      });
      if (usedCount >= voucher.usage_limit) {
        throw new AppError(400, "Voucher has reached its usage limit");
      }
    }

    let discountAmount;
    let discountPercent;

    if (voucher.type === "PERCENT") {
      discountPercent = voucher.value;
      discountAmount = Math.round((voucher.value / 100) * amount);
    } else {
      discountPercent = null;
      discountAmount = Math.min(voucher.value, amount);
    }

    console.log("Check voucher:", voucher.id, "successfully");

    return res.status(200).json({
      success: true,
      message: "Voucher is valid",
      data: {
        voucher_id: voucher.id,
        code: voucher.code,
        discount_amount: discountAmount,
        original_amount: amount
      }
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
  deleteVoucher,
  checkVoucher,
  getMyVouchers 
};