const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');


const User = sequelize.define('User', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    full_name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Họ và tên không được để trống' },
            notEmpty: { msg: 'Họ và tên không được để trống' },
            len: { args: [2, 100], msg: 'Họ và tên phải từ 2 đến 100 ký tự' },
        },
    },
    gender: {
        type: DataTypes.ENUM('MALE', 'FEMALE'),
        allowNull: true,
        validate: {
            isIn: { args: [['MALE', 'FEMALE']], msg: 'Giới tính phải là "MALE" hoặc "FEMALE"' },
        },
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
            isDate: { msg: 'Ngày sinh không hợp lệ (YYYY-MM-DD)' },
        },
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Số điện thoại đã tồn tại' },
        validate: {
            notNull: { msg: 'Số điện thoại không được để trống' },
            notEmpty: { msg: 'Số điện thoại không được để trống' },
            isNumeric: { msg: 'Số điện thoại chỉ được chứa chữ số' },
            len: { args: [10, 15], msg: 'Số điện thoại phải từ 10 đến 15 chữ số' },
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'Email đã tồn tại' },
        validate: {
            notNull: { msg: 'Email không được để trống' },
            notEmpty: { msg: 'Email không được để trống' },
            isEmail: { msg: 'Email không đúng định dạng' },
        },
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: { msg: 'URL ảnh đại diện không hợp lệ' },
        },
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'Mật khẩu không được để trống' },
            notEmpty: { msg: 'Mật khẩu không được để trống' },
        },
    },
    role: {
        type: DataTypes.ENUM('ADMIN', 'USER'),
        allowNull: false,
        defaultValue: 'USER',
        validate: {
            isIn: { args: [['ADMIN', 'USER']], msg: 'Vai trò phải là "ADMIN" hoặc "USER"' },
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
    tableName: 'Users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = User;
