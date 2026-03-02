const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderFood = sequelize.define('OrderFood', {
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
    food_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Đồ ăn không được để trống' },
        },
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notNull: { msg: 'Số lượng không được để trống' },
            isInt: { msg: 'Số lượng phải là số nguyên' },
            min: { args: [1], msg: 'Số lượng phải ít nhất là 1' },
        },
    },
    price_at_purchase: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Giá tại thời điểm mua không được để trống' },
            isFloat: { msg: 'Giá tại thời điểm mua phải là số thực' },
            min: { args: [0], msg: 'Giá tại thời điểm mua không được âm' },
        },
    },
}, {
    tableName: 'OrderFoods',
    timestamps: false,
});

module.exports = OrderFood;
