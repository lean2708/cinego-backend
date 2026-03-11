const { Genre } = require('../models');
const getAllGenres = async (req, res, next) => {
    try {
        console.log('[getAllGenres]');
        const genres = await Genre.findAll({
            where: { is_deleted: false },
        });

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách thể loại thành công',
            data: genres,
        });
    } catch (error) {
        console.error('[getAllGenres] Error:', error.message);
        next(error);
    }
};
const getAllGenresForAdmin = async (req, res, next) => {
    try {
        console.log('[getAdminAllGenres]');
        const genres = await Genre.findAll();

        return res.status(200).json({
            success: true,
            message: 'Lấy toàn bộ danh sách thể loại (Admin) thành công',
            data: genres,
        });
    } catch (error) {
        console.error('[getAdminAllGenres] Error:', error.message);
        next(error);
    }
};
const getGenreById = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('[getGenreById] id:', id);

        const genre = await Genre.findOne({
            where: { id, is_deleted: false },
        });

        if (!genre) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thể loại!' });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy chi tiết thể loại thành công',
            data: genre,
        });
    } catch (error) {
        console.error('[getGenreById] Error:', error.message);
        next(error);
    }
};
const createGenre = async (req, res, next) => {
    try {
        console.log('[createGenre] body:', req.body);
        const newGenre = await Genre.create(req.body);

        return res.status(201).json({
            success: true,
            message: 'Thêm thể loại mới thành công',
            data: newGenre,
        });
    } catch (error) {
        console.error('[createGenre] Error:', error.message);
        next(error);
    }
};
const updateGenre = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('[updateGenre] id:', id, '| body:', req.body);

        const genre = await Genre.findOne({
            where: { id, is_deleted: false },
        });

        if (!genre) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thể loại!' });
        }

        await genre.update(req.body);

        return res.status(200).json({
            success: true,
            message: 'Cập nhật thể loại thành công',
            data: genre,
        });
    } catch (error) {
        console.error('[updateGenre] Error:', error.message);
        next(error);
    }
};
const deleteGenre = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('[deleteGenre] id:', id);

        const updated_by = req.user?.id || req.body.updated_by;
        const genre = await Genre.findOne({
            where: { id, is_deleted: false },
        });

        if (!genre) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thể loại!' });
        }

        await genre.update({
            is_deleted: true,
            updated_by: updated_by || null,
        });

        return res.status(200).json({
            success: true,
            message: 'Đã xóa thể loại thành công',
        });
    } catch (error) {
        console.error('[deleteGenre] Error:', error.message);
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