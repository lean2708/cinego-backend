const Movie = require('../models/Movie');
const Genre = require('../models/Genre');
const MovieGenre = require('../models/MovieGenre');
const sequelize = require('../config/database');
const AppError = require('../utils/appError');

const getAllMovies = async (req, res, next) => {
    try {
        const movies = await Movie.findAll({
            where: { is_deleted: false },
            include: [{
                model: Genre,
                as: 'genres',
                through: { attributes: [] }
            }]
        });

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách phim thành công',
            data: movies,
        });
    } catch (error) {
        next(error);
    }
};

const getAllMoviesForAdmin = async (req, res, next) => {
    try {
        const movies = await Movie.findAll({
            include: [{
                model: Genre,
                as: 'genres',
                through: { attributes: [] }
            }],
            order: [['is_deleted', 'ASC'], ['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: 'Lấy toàn bộ danh sách phim (Admin) thành công',
            data: movies,
        });
    } catch (error) {
        next(error);
    }
};

const getMovieById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) throw new AppError(400, "ID phim không hợp lệ");

        const movie = await Movie.findOne({
            where: { id, is_deleted: false },
            include: [{
                model: Genre,
                as: 'genres',
                through: { attributes: [] }
            }]
        });

        if (!movie) throw new AppError(404, "Không tìm thấy phim");

        return res.status(200).json({
            success: true,
            message: 'Lấy chi tiết phim thành công',
            data: movie,
        });
    } catch (error) {
        next(error);
    }
};

const createMovie = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { title, duration, release_date, genreIds, ...movieData } = req.body;

        if (!title || !duration || !release_date) {
            throw new AppError(400, "Vui lòng cung cấp tiêu đề, thời lượng và ngày khởi chiếu");
        }

        if (isNaN(duration) || duration <= 0) {
            throw new AppError(400, "Thời lượng phim phải là số dương");
        }

        if (genreIds && !Array.isArray(genreIds)) {
            throw new AppError(400, "Danh sách thể loại (genreIds) phải là một mảng");
        }

        const newMovie = await Movie.create(
            { ...movieData, title, duration, release_date },
            { transaction }
        );

        if (genreIds && genreIds.length > 0) {
            const genres = await Genre.findAll({ where: { id: genreIds } });
            if (genres.length !== genreIds.length) {
                throw new AppError(404, "Một hoặc nhiều thể loại không tồn tại");
            }
            await newMovie.setGenres(genreIds, { transaction });
        }

        await transaction.commit();
        return res.status(201).json({
            success: true,
            message: 'Thêm phim mới thành công',
            data: newMovie,
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

const updateMovie = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const { id } = req.params;
        const { genreIds, duration, ...updateData } = req.body;

        if (isNaN(id)) throw new AppError(400, "ID phim không hợp lệ");

        const movie = await Movie.findOne({ where: { id, is_deleted: false } });
        if (!movie) throw new AppError(404, "Không tìm thấy phim");

        if (duration !== undefined && (isNaN(duration) || duration <= 0)) {
            throw new AppError(400, "Thời lượng phim phải là số dương");
        }

        if (genreIds && !Array.isArray(genreIds)) {
            throw new AppError(400, "genreIds phải là một mảng");
        }

        await movie.update({ ...updateData, duration }, { transaction });

        if (genreIds) {
            const genres = await Genre.findAll({ where: { id: genreIds } });
            if (genres.length !== genreIds.length) {
                throw new AppError(404, "Một hoặc nhiều thể loại không tồn tại");
            }
            await movie.setGenres(genreIds, { transaction });
        }

        await transaction.commit();
        
        const updatedMovie = await Movie.findByPk(id, {
            include: [{ model: Genre, as: 'genres', through: { attributes: [] } }]
        });

        return res.status(200).json({
            success: true,
            message: 'Cập nhật phim thành công',
            data: updatedMovie,
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};

const deleteMovie = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) throw new AppError(400, "ID phim không hợp lệ");

        const movie = await Movie.findOne({ where: { id, is_deleted: false } });
        if (!movie) throw new AppError(404, "Không tìm thấy phim");

        await movie.update({
            is_deleted: true,
            updated_by: req.user?.id || null,
        });

        return res.status(200).json({
            success: true,
            message: 'Đã xóa phim thành công',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllMovies,
    getAllMoviesForAdmin,
    getMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
};