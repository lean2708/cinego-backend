const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movie = sequelize.define('Movie', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Tên phim không được để trống' },
            notEmpty: { msg: 'Tên phim không được để trống' },
        },
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'Thời lượng phim không được để trống' },
            isInt: { msg: 'Thời lượng phim phải là số nguyên' },
            min: { args: [1], msg: 'Thời lượng phim phải lớn hơn 0 phút' },
        },
    },
    directors_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    release_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: { msg: 'Ngày phát hành không hợp lệ' },
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    poster_urls: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    trailer_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: { msg: 'URL trailer không hợp lệ' },
        },
    },
    status: {
        type: DataTypes.ENUM('SHOWING', 'COMING_SOON', 'PASSED'),
        allowNull: false,
        validate: {
            notNull: { msg: 'Trạng thái phim không được để trống' },
            isIn: {
                args: [['SHOWING', 'COMING_SOON', 'PASSED']],
                msg: 'Trạng thái phim phải là "SHOWING", "COMING_SOON" hoặc "PASSED"',
            },
        },
    },
    is_deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    updated_by: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
}, {
    tableName: 'Movies',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Movie;
