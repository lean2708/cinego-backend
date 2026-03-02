const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Province = sequelize.define('Province', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Tên tỉnh/thành phố đã tồn tại' },
        validate: {
            notNull: { msg: 'Tên tỉnh/thành phố không được để trống' },
            notEmpty: { msg: 'Tên tỉnh/thành phố không được để trống' },
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
    tableName: 'Provinces',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Province;
