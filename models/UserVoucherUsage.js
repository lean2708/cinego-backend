const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserVoucherUsage = sequelize.define('UserVoucherUsage', {
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
    voucher_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Voucher không được để trống' },
        },
    },
    order_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Đơn hàng không được để trống' },
        },
    },
    used_at: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: { msg: 'Thời gian sử dụng voucher không được để trống' },
            isDate: { msg: 'Thời gian sử dụng voucher không hợp lệ' },
        },
    },
}, {
    tableName: 'UserVoucherUsages',
    timestamps: false,
});

module.exports = UserVoucherUsage;
