const Cinema = require("../models/Cinema");
const Province = require("../models/Province");
const AppError = require("../utils/appError");

const addCinema = async (req, res, next) => {
    try {
        const { name, address, image_urls, province_id } = req.body;
        const data = {
            name,
            address,
            image_urls,
            province_id,
            updated_by: req.user.id
        };
        const newCinema = await Cinema.create(data);

        return res.status(201).json({
            success: true,
            message: "Đã tạo rạp chiếu: " + name,
            data: newCinema
        });
    } catch (error) {
        next(error);
    }
};

const updateCinema = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, address, image_urls, province_id } = req.body;
        const cinemaToUpdate = await Cinema.findByPk(id);

        if (!cinemaToUpdate || cinemaToUpdate.is_deleted) {
            throw new AppError(404, "Không tìm thấy rạp chiếu");
        }

        const data = {
            name: name || cinemaToUpdate.name,
            address: address || cinemaToUpdate.address,
            image_urls: image_urls || cinemaToUpdate.image_urls,
            province_id: province_id || cinemaToUpdate.province_id,
            updated_by: req.user.id
        };

        await cinemaToUpdate.update(data);

        return res.status(200).json({
            success: true,
            message: "Đã cập nhật thông tin rạp: " + cinemaToUpdate.name,
            data: cinemaToUpdate
        });
    } catch (error) {
        next(error);
    }
};

const deleteCinema = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cinemaToDelete = await Cinema.findByPk(id);

        if (!cinemaToDelete || cinemaToDelete.is_deleted) {
            throw new AppError(404, "Không tìm thấy rạp chiếu để xóa");
        }

        await cinemaToDelete.update({
            is_deleted: true,
            updated_by: req.user.id
        });

        return res.status(200).json({
            success: true,
            message: "Đã xóa rạp chiếu: " + cinemaToDelete.name
        });
    } catch (error) {
        next(error);
    }
};

const getAllCinemas = async (req, res, next) => {
    try {
        const { province_id } = req.query;
        const filter = { is_deleted: false };
        if (province_id) filter.province_id = province_id;

        const cinemas = await Cinema.findAll({
            where: filter,
            include: [
                {
                    model: Province,
                    attributes: ['id', 'name']
                }
            ],
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

const getCinemaById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const cinema = await Cinema.findOne({
            where: { id, is_deleted: false },
            include: [
                {
                    model: Province,
                    attributes: ['id', 'name']
                }
            ]
        });

        if (!cinema) {
            throw new AppError(404, "Không tìm thấy rạp chiếu");
        }

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
    getAllCinemas,
    getCinemaById
};