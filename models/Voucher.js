const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Voucher = sequelize.define('Voucher', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Mã voucher đã tồn tại' },
        validate: {
            notNull: { msg: 'Mã voucher không được để trống' },
            notEmpty: { msg: 'Mã voucher không được để trống' },
        },
    },
    value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'Giá trị voucher không được để trống' },
            isInt: { msg: 'Giá trị voucher phải là số nguyên' },
            min: { args: [0], msg: 'Giá trị voucher không được âm' },
        },
    },
    type: {
        type: DataTypes.ENUM('percent', 'cash'),
        allowNull: false,
        validate: {
            notNull: { msg: 'Loại voucher không được để trống' },
            isIn: {
                args: [['percent', 'cash']],
                msg: 'Loại voucher phải là "percent" hoặc "cash"',
            },
        },
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: { msg: 'Ngày bắt đầu voucher không được để trống' },
            isDate: { msg: 'Ngày bắt đầu voucher không hợp lệ' },
        },
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notNull: { msg: 'Ngày kết thúc voucher không được để trống' },
            isDate: { msg: 'Ngày kết thúc voucher không hợp lệ' },
        },
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            isInt: { msg: 'Giới hạn sử dụng phải là số nguyên' },
            min: { args: [1], msg: 'Giới hạn sử dụng phải ít nhất là 1' },
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
    tableName: 'Vouchers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Voucher;
