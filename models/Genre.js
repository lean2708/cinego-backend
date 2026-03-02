const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Genre = sequelize.define('Genre', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Tên thể loại đã tồn tại' },
        validate: {
            notNull: { msg: 'Tên thể loại không được để trống' },
            notEmpty: { msg: 'Tên thể loại không được để trống' },
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
    tableName: 'Genres',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = Genre;
