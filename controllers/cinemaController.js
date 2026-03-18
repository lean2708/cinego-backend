const sequelize = require('../config/database');
const Cinema = require("../models/Cinema");
const Province = require("../models/Province");
const AppError = require("../utils/appError");

const getCinemasForUser = async (req, res, next) => {
    try {
        const { province_id } = req.query;

        const filter = { is_deleted: false };
        if (province_id) {
            if (isNaN(province_id)) throw new AppError(400, "province_id phải là số");
            filter.province_id = province_id;
        }

        const cinemas = await Cinema.findAll({
            where: filter,
            include: [{
                model: Province,
                as: 'province',
                attributes: ['id', 'name']
            }],
            order: [['name', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            results: cinemas.length,
            data: cinemas
        });
    } catch (error) {
        next(error);
    }
};

const getCinemasForAdmin = async (req, res, next) => {
    try {
        const { province_id } = req.query;

        const filter = {};
        if (province_id) {
            if (isNaN(province_id)) throw new AppError(400, "province_id phải là số");
            filter.province_id = province_id;
        }

        const cinemas = await Cinema.findAll({
            where: filter,
            include: [{
                model: Province,
                as: 'province',
                attributes: ['id', 'name']
            }],
            order: [
                ['is_deleted', 'ASC'],
                ['name', 'ASC']
            ]
        });

        return res.status(200).json({
            success: true,
            results: cinemas.length,
            data: cinemas
        });
    } catch (error) {
        next(error);
    }
};

const addCinema = async (req, res, next) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const { name, address, province_id, phone } = req.body;

            if (!name || !address || !province_id) {
                throw new AppError(400, "Thiếu thông tin rạp bắt buộc");
            }

            if (phone && !/^[0-9]{10}$/.test(phone)) {
                throw new AppError(400, "Số điện thoại không hợp lệ");
            }

            const province = await Province.findByPk(province_id, { transaction: t });
            if (!province) throw new AppError(404, "Tỉnh thành không tồn tại");

            const newCinema = await Cinema.create({
                ...req.body,
                updated_by: req.user.id
            }, { transaction: t });

            return newCinema;
        });

        return res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const updateCinema = async (req, res, next) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const { id } = req.params;
            const { province_id, phone } = req.body;

            if (isNaN(id)) throw new AppError(400, "ID rạp không hợp lệ");

            const cinema = await Cinema.findByPk(id, { transaction: t });
            if (!cinema) throw new AppError(404, "Không tìm thấy rạp");

            if (province_id) {
                const province = await Province.findByPk(province_id, { transaction: t });
                if (!province) throw new AppError(404, "Tỉnh thành không tồn tại");
            }

            if (phone && !/^[0-9]{10}$/.test(phone)) {
                throw new AppError(400, "Số điện thoại không hợp lệ");
            }

            await cinema.update({
                ...req.body,
                updated_by: req.user.id
            }, { transaction: t });

            return cinema;
        });

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const deleteCinema = async (req, res, next) => {
    try {
        await sequelize.transaction(async (t) => {
            const { id } = req.params;
            if (isNaN(id)) throw new AppError(400, "ID rạp không hợp lệ");

            const cinema = await Cinema.findByPk(id, { transaction: t });
            if (!cinema) throw new AppError(404, "Không tìm thấy rạp");

            await cinema.update({
                is_deleted: true,
                updated_by: req.user.id
            }, { transaction: t });
        });

        return res.status(200).json({
            success: true
        });
    } catch (error) {
        next(error);
    }
};

const getCinemaById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) throw new AppError(400, "ID rạp không hợp lệ");

        const cinema = await Cinema.findOne({
            where: {
                id,
                is_deleted: false
            },
            include: [{
                model: Province,
                as: 'province',
                attributes: ['id', 'name']
            }]
        });

        if (!cinema) throw new AppError(404, "Không tìm thấy rạp");

        return res.status(200).json({
            success: true,
            data: cinema
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addCinema,
    updateCinema,
    deleteCinema,
    getCinemasForUser,
    getCinemasForAdmin,
    getCinemaById
};