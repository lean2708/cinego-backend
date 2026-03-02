const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CinemaRoom = sequelize.define('CinemaRoom', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    cinema_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            notNull: { msg: 'Rạp chiếu không được để trống' },
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Tên phòng chiếu không được để trống' },
            notEmpty: { msg: 'Tên phòng chiếu không được để trống' },
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
    tableName: 'CinemaRooms',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = CinemaRoom;
