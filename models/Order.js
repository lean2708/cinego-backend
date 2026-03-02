const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Người dùng không được để trống' },
        },
    },
    booking_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Mã đặt vé đã tồn tại' },
        validate: {
            notNull: { msg: 'Mã đặt vé không được để trống' },
            notEmpty: { msg: 'Mã đặt vé không được để trống' },
        },
    },
    status: {
        type: DataTypes.ENUM('pending', 'success', 'failed'),
        allowNull: false,
        validate: {
            notNull: { msg: 'Trạng thái đơn hàng không được để trống' },
            isIn: {
                args: [['pending', 'success', 'failed']],
                msg: 'Trạng thái đơn hàng phải là "pending", "success" hoặc "failed"',
            },
        },
    },
    ticket_total: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isFloat: { msg: 'Tổng tiền vé phải là số thực' },
            min: { args: [0], msg: 'Tổng tiền vé không được âm' },
        },
    },
    food_total: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isFloat: { msg: 'Tổng tiền đồ ăn phải là số thực' },
            min: { args: [0], msg: 'Tổng tiền đồ ăn không được âm' },
        },
    },
    discount_applied: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isFloat: { msg: 'Số tiền giảm giá phải là số thực' },
            min: { args: [0], msg: 'Số tiền giảm giá không được âm' },
        },
    },
    total_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Tổng thanh toán không được để trống' },
            isFloat: { msg: 'Tổng thanh toán phải là số thực' },
            min: { args: [0], msg: 'Tổng thanh toán không được âm' },
        },
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    payment_time: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            isDate: { msg: 'Thời gian thanh toán không hợp lệ' },
        },
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    tableName: 'Orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Order;
