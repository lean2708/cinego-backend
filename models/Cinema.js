const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cinema = sequelize.define('Cinema', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Tên rạp chiếu không được để trống' },
            notEmpty: { msg: 'Tên rạp chiếu không được để trống' },
        },
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Địa chỉ rạp chiếu không được để trống' },
            notEmpty: { msg: 'Địa chỉ rạp chiếu không được để trống' },
        },
    },
    image_urls: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    province_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Tỉnh/thành phố không được để trống' },
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
    tableName: 'Cinemas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Cinema;
