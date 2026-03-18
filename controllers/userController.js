const User = require("../models/User");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const sequelize = require("../config/database");



const createUser = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {

        const {full_name, email, phone, password, role} = req.body;

        console.log("Received a request to create user");

        if(!full_name || !email || !phone || !password || !role){
            throw new AppError(400, "Please provide information (full_name, email, phone, password, role)");
        }

        const existingUser = await User.findOne({
            where : {
                [Op.or] : [{email : email}, {phone : phone}]
            }
        });

        if(existingUser){
            throw new AppError(409, "email or phone exist");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            full_name,
            email,
            phone,
            password_hash : hashedPassword,
            role : role
        },{ transaction });

        newUser.password_hash = undefined;

        await transaction.commit();

        console.log("Create user:", newUser.id," successfully");

        return res.status(201).json({
            success : true,
            message : "Create User successfully",
            data : {
                user : newUser
            }
        })

        
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}




const getUserById = async (req, res, next) => {
    try {
        console.log("Received a request to fetch user by id:", req.params.id);
        const user = await User.findByPk(req.params.id);

        if(!user){
            throw new AppError(404, "User not found");
        }

        console.log("Get user by id:", req.params.id, " successfully");

        return res.status(200).json({
            success : true,
            message : "Get User By Id",
            data : {
                user
            }
        });
        
    } catch (error) {
        next(error);
    }
}


const getAllUsers = async (req, res, next) => {
    try {
        const pageNo = parseInt(req.query.pageNo) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (pageNo - 1) * pageSize;

        console.log("Received request get all users with pageNo: " + req.query.pageNo + " pageSize:" + req.query.pageSize );

        const { count, rows } = await User.findAndCountAll({
            limit: pageSize,
            offset: offset,
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'DESC']]
        });

        console.log("Get all users with pageNo:" + pageNo + " pageSize:" + pageSize + " successfully");

        return res.status(200).json({
            success: true,
            message: "Get All User successfully",
            data: {
                pageNo: pageNo,
                pageSize: pageSize,
                totalPages: Math.ceil(count / pageSize),
                totalItems: count,
                items: rows
            }
        });
    } catch (error) {
        next(error);
    }
};



const updateUser = async(req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        console.log("Recieved a request to update user:", req.params.id);
        
        const user = await User.findByPk(req.params.id);

        if(!user){
            throw new AppError(404, "User not found");
        }

        const {full_name, phone, gender, dob} = req.body;

        user.full_name = full_name || user.full_name;
        user.gender = gender || user.gender;
        user.dob = dob || user.dob;
        user.phone = phone || user.phone;

        await user.save({ transaction });

        await transaction.commit();

        console.log("Update user:", req.params.id, " successfully");

        return res.status(200).json({
            success : true,
            message : "Update user successfully",
            data : {
                user
            }
        })
        
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
}



const deleteUser = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        const userToDeleteId = req.params.id;

        console.log("Received request to soft delete user:", userToDeleteId);

        const loggedInUser = req.user;

        const userToDelete = await User.findOne({
            where: {
                id: userToDeleteId
            }
        });

        if (!userToDelete) {
            throw new AppError(404, "User not found");
        }

        await userToDelete.update({
            is_deleted: true,
            updated_by: loggedInUser.id
        },{ transaction });
        
        await transaction.commit();

        console.log("Soft delete user:", userToDeleteId, " successfully");

        return res.status(200).json({
            success: true,
            message: "Delete user successfully"
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


module.exports = {
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser
}
