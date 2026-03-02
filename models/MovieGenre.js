const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MovieGenre = sequelize.define('MovieGenre', {
    movie_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        validate: {
            notNull: { msg: 'movie_id không được để trống' },
        },
    },
    genre_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        allowNull: false,
        validate: {
            notNull: { msg: 'genre_id không được để trống' },
        },
    },
}, {
    tableName: 'MovieGenres',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = MovieGenre;
