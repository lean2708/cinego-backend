const Genre = require('../models/Genre');
const sequelize = require('../config/database');
const AppError = require('../utils/appError');

const getAllGenres = async (req, res, next) => {
    try {
        const genres = await Genre.findAll({
            where: { is_deleted: false },
            order: [['name', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách thể loại thành công',
            data: genres,
        });
    } catch (error) {
        next(error);
    }
};

const getAllGenresForAdmin = async (req, res, next) => {
    try {
        const genres = await Genre.findAll({
            order: [['is_deleted', 'ASC'], ['name', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Lấy toàn bộ danh sách thể loại (Admin) thành công',
            data: genres,
        });
    } catch (error) {
        next(error);
    }
};

const getGenreById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const genre = await Genre.findOne({
            where: { id, is_deleted: false },
        });

        if (!genre) throw new AppError(404, 'Không tìm thấy thể loại!');

        return res.status(200).json({
            success: true,
            message: 'Lấy chi tiết thể loại thành công',
            data: genre,
        });
    } catch (error) {
        next(error);
    }
};

const createGenre = async (req, res, next) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const newGenre = await Genre.create(req.body, { transaction: t });
            return newGenre;
        });

        return res.status(201).json({
            success: true,
            message: 'Thêm thể loại mới thành công',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const updateGenre = async (req, res, next) => {
    try {
        const result = await sequelize.transaction(async (t) => {
            const { id } = req.params;
            const genre = await Genre.findOne({
                where: { id, is_deleted: false },
                transaction: t
            });

            if (!genre) throw new AppError(404, 'Không tìm thấy thể loại!');

            await genre.update(req.body, { transaction: t });
            return genre;
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật thể loại thành công',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const deleteGenre = async (req, res, next) => {
    try {
        await sequelize.transaction(async (t) => {
            const { id } = req.params;
            const updated_by = req.user?.id || req.body.updated_by;

            const genre = await Genre.findOne({
                where: { id, is_deleted: false },
                transaction: t
            });

            if (!genre) throw new AppError(404, 'Không tìm thấy thể loại!');

            await genre.update({
                is_deleted: true,
                updated_by: updated_by || null,
            }, { transaction: t });
        });

        return res.status(200).json({
            success: true,
            message: 'Đã xóa thể loại thành công',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllGenres,
    getAllGenresForAdmin,
    getGenreById,
    createGenre,
    updateGenre,
    deleteGenre,
};