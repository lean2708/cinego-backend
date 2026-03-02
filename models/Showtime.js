const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Showtime = sequelize.define('Showtime', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    movie_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Phim không được để trống' },
        },
    },
    room_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Phòng chiếu không được để trống' },
        },
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: { msg: 'Thời gian bắt đầu không được để trống' },
            isDate: { msg: 'Thời gian bắt đầu không hợp lệ' },
        },
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: { msg: 'Thời gian kết thúc không hợp lệ' },
        },
    },
    base_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Giá cơ bản không được để trống' },
            isFloat: { msg: 'Giá cơ bản phải là số thực' },
            min: { args: [0], msg: 'Giá cơ bản không được âm' },
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
    tableName: 'Showtimes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Showtime;
