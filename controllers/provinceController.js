const province = require("../models/Province");
const AppError = require("../utils/appError");
const sequelize = require('../config/database');

const addProvince = async (req, res, next) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const data = {
                name: req.body.name,
                updated_by: req.user.id
            };
            
            const newProvince = await province.create(data, { transaction: t });
            return newProvince;
        });

        return res.status(201).json({
            success: true,
            message: "Đã tạo tỉnh/thành phố: " + result.name,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

const updateProvince = async (req, res, next) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const { id } = req.params;
            const data = {
                name: req.body.name,
                updated_by: req.user.id
            };

            const provinceToUpdate = await province.findByPk(id, { transaction: t });

            if (!provinceToUpdate) {
                throw new AppError(404, "Không tìm thấy tỉnh/thành phố");
            }

            await provinceToUpdate.update(data, { transaction: t });
            return provinceToUpdate;
        });

        return res.status(200).json({
            success: true,
            message: "Đã cập nhật tỉnh/thành phố: " + result.name,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

const deleteProvince = async (req, res, next) => {
    try {
        await sequelize.transaction(async (t) => {
            const { id } = req.params;
            const data = {
                is_deleted: true,
                updated_by: req.user.id
            };

            const provinceToDelete = await province.findByPk(id, { transaction: t });

            if (!provinceToDelete) {
                throw new AppError(404, "Không tìm thấy tỉnh/thành phố để xóa");
            }

            await provinceToDelete.update(data, { transaction: t });
        });

        return res.status(200).json({
            success: true,
            message: `Đã xóa tỉnh/thành phố thành công`
        });
    } catch (error) {
        next(error);
    }
}

const getAllProvinces = async (req, res, next) => {
    try {
        const provinces = await province.findAll({
            where: { is_deleted: false },
            order: [['name', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            results: provinces.length,
            data: provinces
        });
    } catch (error) {
        next(error);
    }
};

const getAllProvincesForAdmin = async (req, res, next) => {
    try {
        const provinces = await province.findAll({
            order: [['is_deleted', 'ASC'], ['name', 'ASC']] 
        });

        return res.status(200).json({
            success: true,
            message: "Danh sách đầy đủ cho quản trị viên",
            results: provinces.length,
            data: provinces
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addProvince,
    updateProvince,
    deleteProvince,
    getAllProvinces,
    getAllProvincesForAdmin 
};