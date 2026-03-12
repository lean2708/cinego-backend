const { Movie, MovieGenre } = require('../models');
const sequelize = require('../config/database');
const AppError = require('../utils/appError');

// 1. Lấy danh sách phim cho NGƯỜI DÙNG (Chỉ lấy phim chưa bị xóa)
const getAllMovies = async (req, res, next) => {
    try {
        console.log('[getAllMovies]');
        const movies = await Movie.findAll({ 
            where: { is_deleted: false } 
        });

        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách phim thành công',
            data: movies,
        });
    } catch (error) {
        console.error('[getAllMovies] Error:', error.message);
        next(error);
    }
};
const getAllMoviesForAdmin= async (req, res, next) => {
    try {
        console.log('[getAdminAllMovies]');
        const movies = await Movie.findAll(); 

        return res.status(200).json({
            success: true,
            message: 'Lấy toàn bộ danh sách phim (Admin) thành công',
            data: movies,
        });
    } catch (error) {
        console.error('[getAdminAllMovies] Error:', error.message);
        next(error);
    }
};
const getMovieById = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('[getMovieById] id:', id);

        const movie = await Movie.findOne({ where: { id, is_deleted: false } });
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phim!' });
        }

        return res.status(200).json({
            success: true,
            message: 'Lấy chi tiết phim thành công',
            data: movie,
        });
    } catch (error) {
        console.error('[getMovieById] Error:', error.message);
        next(error);
    }
};
const createMovie = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    
    try {
        console.log('[createMovie] body:', req.body);
        const { genreIds, ...movieData } = req.body;

        const newMovie = await Movie.create(movieData, { transaction });

        if (genreIds && Array.isArray(genreIds) && genreIds.length > 0) {
            const movieGenresData = genreIds.map((genre_id) => ({
                movie_id: newMovie.id,
                genre_id: genre_id,
            }));
            await MovieGenre.bulkCreate(movieGenresData, { transaction });
        }

        await transaction.commit();
        return res.status(201).json({
            success: true,
            message: 'Thêm phim mới thành công',
            data: newMovie,
        });
    } catch (error) {
        console.error('[createMovie] Error:', error.message);
        await transaction.rollback();
        next(error);
    }
};
const updateMovie = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        console.log('[updateMovie] id:', id, '| body:', req.body);
        const { genreIds, ...updateData } = req.body;

        const movie = await Movie.findOne({ where: { id, is_deleted: false } });
        if (!movie) {
            await transaction.rollback();
            return res.status(404).json({ success: false, message: 'Không tìm thấy phim!' });
        }

        await movie.update(updateData, { transaction });

        if (genreIds && Array.isArray(genreIds)) {
            await MovieGenre.destroy({ where: { movie_id: id }, transaction });

            if (genreIds.length > 0) {
                const movieGenresData = genreIds.map((genre_id) => ({
                    movie_id: id,
                    genre_id: genre_id,
                }));
                await MovieGenre.bulkCreate(movieGenresData, { transaction });
            }
        }

        await transaction.commit();
        return res.status(200).json({
            success: true,
            message: 'Cập nhật phim thành công',
            data: movie,
        });
    } catch (error) {
        console.error('[updateMovie] Error:', error.message);
        await transaction.rollback();
        next(error);
    }
};
const deleteMovie = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log('[deleteMovie] id:', id);

        const updated_by = req.user?.id || req.body.updated_by; 
        const movie = await Movie.findOne({ where: { id, is_deleted: false } });
        
        if (!movie) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy phim!' });
        }

        await movie.update({
            is_deleted: true,
            updated_by: updated_by || null,
        });

        return res.status(200).json({
            success: true,
            message: 'Đã xóa phim thành công',
        });
    } catch (error) {
        console.error('[deleteMovie] Error:', error.message);
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