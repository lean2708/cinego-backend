const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');



const Actor = sequelize.define('Actor', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: { msg: 'URL ảnh không hợp lệ' }
        }
    }
}, {
    tableName: 'Actors',
    timestamps: false,
});


module.exports = Actor;