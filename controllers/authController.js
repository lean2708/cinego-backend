const User = require("../models/User");
const AppError = require("../utils/appError");
const { generateAccessToken } = require("../utils/jwt");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");


const register = async (req, res, next) => {
    try {
        const {full_name, email, phone, password, confirm_password} = req.body;

        console.log("Received a request to register an account for email :", email);

        if(!full_name || !email || !phone || !password || !confirm_password){
            throw new AppError(400, "All fields are required");
        }

        if(password !== confirm_password){
            throw new AppError(400, "Password and Confirm Password do not match");
        }

        const existingUser = await User.findOne({
            where : {
                [Op.or] : [{email : email}, {phone : phone}]
            },
        });

        if(existingUser){
            throw new AppError(409, "Email or Phone already in use");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            full_name,
            email,
            phone,
            password_hash : hashedPassword,
            role : 'USER'
        });


        console.log("Register an account for email :", email, " successfully");

        const accessToken = generateAccessToken(newUser);

        return res.status(201).json({
            success : true,
            message : "Register account successfully",
            data : {
                accessToken : accessToken
            }
        })
    } catch (error) {
        next(error);
    }
}



const login = async (req, res, next) => {
    try{
        const {email, password} = req.body;
        console.log("Received a request to login for email :", email);

        if(!email || !password){
            throw new AppError(400, "Please provide email and password");
        }

        const user = await User.findOne({
            where : {email : email},
        });

        if(!user){
            throw new AppError(401, "User not exists");
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if(!isMatch){
            throw new AppError(401, "Password not conrrect");
        }

        const accessToken = generateAccessToken(user);

        console.log("Login successfully for email:", email);

        return res.status(200).json({
            success : true,
            message : "Login successfully",
            data : {
                accessToken : accessToken,
                role: user.role
            }
        })

    } catch (error) {
        next(error);
    }
}



const getMyProfile = async (req, res, next) =>{
    try {
        const user = req.user;

        console.log("Received a request to get myinfo for userId:", user.id);

        console.log("Get MyInfo for userId:", user.id);

        return res.status(200).json({
            success : true,
            message : "Get my info",
            data : {
                user
            },
        });
        
    } catch (error) {
        next(error);
    }
}



const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const { currentPassword, newPassword, confirmPassword } = req.body;

        console.log("Received a request to change password for userId:" + userId);

        if (!currentPassword || !newPassword || !confirmPassword) {
            throw new AppError(400, "Please provide current password, new password and confirm password");
        }

        if (newPassword !== confirmPassword) {
            throw new AppError(400, "New Password and Confirm Password do not match");
        }

        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError(404, "User not found");
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isMatch) {
            throw new AppError(400, "Current password is incorrect");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password_hash = hashedPassword;
        await user.save();

        console.log("Password changed successfully for userId:" + userId);

        return res.status(200).json({
            success: true,
            message: "Change password successfully"
        });

    } catch (error) {
        next(error);
    }
};



module.exports = {
    register,
    login,
    getMyProfile,
    changePassword
}