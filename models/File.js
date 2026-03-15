const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const File = sequelize.define('File', {
  public_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    primaryKey: true
  },
  uploader_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  original_filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  resource_type: {
    type: DataTypes.ENUM('image', 'video'),
    allowNull: false
  },
}, {
  tableName: 'Files',
  timestamps: true,
  indexes: [
    {
      name: 'files_uploader_id_index',
      fields: ['uploader_id'], 
    },
    {
      name: 'files_resource_type_index',
      fields: ['resource_type'],
    }
  ]
});


module.exports = File;