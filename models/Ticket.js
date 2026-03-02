const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Đơn hàng không được để trống' },
        },
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
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Giá vé không được để trống' },
            isFloat: { msg: 'Giá vé phải là số thực' },
            min: { args: [0], msg: 'Giá vé không được âm' },
        },
    },
    qr_code: {
        type: DataTypes.STRING,
        allowNull: true,
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
    tableName: 'Tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Ticket;
