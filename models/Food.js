const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Food = sequelize.define('Food', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Tên đồ ăn không được để trống' },
            notEmpty: { msg: 'Tên đồ ăn không được để trống' },
        },
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: { msg: 'URL hình ảnh đồ ăn không hợp lệ' },
        },
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            len: {
                args: [0, 1000],
                msg: 'Mô tả tối đa 1000 ký tự'
            }
        }
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Giá đồ ăn không được để trống' },
            isFloat: { msg: 'Giá đồ ăn phải là số thực' },
            min: { args: [0], msg: 'Giá đồ ăn không được âm' },
        },
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isInt: { msg: 'Số lượng tồn kho phải là số nguyên' },
            min: { args: [0], msg: 'Số lượng tồn kho không được âm' },
        },
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    tableName: 'Foods',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Food;
