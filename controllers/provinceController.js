const province = require("../models/Province");
const AppError = require("../utils/appError");
const addProvince = async (req, res, next) => {
    try {
        const data = {
            name: req.body.name,
            updated_by: req.user.id
        };
        const newProvince= await province.create(data);
        return res.status(201).json({
            success:true,
            message:"Đã tạo tỉnh/thành phố: " + data.name,
            data
        })
    } catch (error) {
        next(error);
    }
}
const updateProvince = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = {
            name: req.body.name,
            updated_by: req.user.id
        };

        const provinceToUpdate = await province.findByPk(id);

        if (!provinceToUpdate) {
            throw new AppError(404, "Không tìm thấy tỉnh/thành phố");
        }

        await provinceToUpdate.update(data);

        return res.status(200).json({
            success: true,
            message: "Đã cập nhật tỉnh/thành phố: " + data.name,
            data: provinceToUpdate
        });
    } catch (error) {
        next(error);
    }
}
const deleteProvince = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = {
            is_deleted: true,
            updated_by: req.user.id
        };

        const provinceToDelete = await province.findByPk(id);

        if (!provinceToDelete) {
            throw new AppError(404, "Không tìm thấy tỉnh/thành phố để xóa");
        }

        await provinceToDelete.update(data);

        return res.status(200).json({
            success: true,
            message: "Đã xóa tỉnh/thành phố: " + provinceToDelete.name
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
}
module.exports = {
    addProvince,
    updateProvince,
    deleteProvince,
    getAllProvinces
};