const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Seat = sequelize.define('Seat', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    room_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Phòng chiếu không được để trống' },
        },
    },
    row_label: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Nhãn hàng ghế không được để trống' },
            notEmpty: { msg: 'Nhãn hàng ghế không được để trống' },
        },
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'Số thứ tự ghế không được để trống' },
            isInt: { msg: 'Số thứ tự ghế phải là số nguyên' },
            min: { args: [1], msg: 'Số thứ tự ghế phải lớn hơn 0' },
        },
    },
    type: {
        type: DataTypes.ENUM('VIP', 'COUPLE', 'STANDARD'),
        allowNull: false,
        validate: {
            notNull: { msg: 'Loại ghế không được để trống' },
            isIn: {
                args: [['VIP', 'COUPLE', 'STANDARD']],
                msg: 'Loại ghế phải là "VIP", "COUPLE" hoặc "STANDARD"',
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
    tableName: 'Seats',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Seat;
