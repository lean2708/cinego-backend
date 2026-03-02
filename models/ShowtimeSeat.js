const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ShowtimeSeat = sequelize.define('ShowtimeSeat', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    showtime_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Suất chiếu không được để trống' },
        },
    },
    seat_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Ghế ngồi không được để trống' },
        },
    },
    status: {
        type: DataTypes.ENUM('available', 'holding', 'booked'),
        allowNull: false,
        validate: {
            notNull: { msg: 'Trạng thái ghế không được để trống' },
            isIn: {
                args: [['available', 'holding', 'booked']],
                msg: 'Trạng thái ghế phải là "available", "holding" hoặc "booked"',
            },
        },
    },
    hold_expired_at: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: { msg: 'Thời gian hết hạn giữ ghế không hợp lệ' },
        },
    },
}, {
    tableName: 'ShowtimeSeats',
    timestamps: false,
});

module.exports = ShowtimeSeat;
