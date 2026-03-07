const Food = require("../models/Food");
const AppError = require("../utils/appError");
const { Op } = require("sequelize");



const createFood = async (req, res, next) => {
    try {
        const { name, image_url, description, price, stock_quantity, is_available } = req.body;

        console.log("Received a request to create food");

        if (!name || !price) {
            throw new AppError(400, "Please provide information (name, price)");
        }

        const existingFood = await Food.findOne({
            where: {
                name: name
            }
        });

        if (existingFood) {
            throw new AppError(409, "Food name already exists");
        }

        const newFood = await Food.create({
            name,
            image_url,
            description,
            price,
            stock_quantity,
            is_available
        });

        console.log("Create food:", newFood.id, "successfully");

        return res.status(201).json({
            success: true,
            message: "Create Food successfully",
            data: {
                food: newFood
            }
        });

    } catch (error) {
        next(error);
    }
};




const getFoodById = async (req, res, next) => {
    try {

        console.log("Received request get food by id:", req.params.id);

        const food = await Food.findOne({
            where: {
                id: req.params.id
            }
        });

        if (!food) {
            throw new AppError(404, "Food not found");
        }

        console.log("Get food:", req.params.id, "successfully");

        return res.status(200).json({
            success: true,
            message: "Get Food By Id successfully",
            data: {
                food
            }
        });

    } catch (error) {
        next(error);
    }
};



const getAllFoodsForAdmin = async (req, res, next) => {
    try {

        const pageNo = parseInt(req.query.pageNo) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (pageNo - 1) * pageSize;

        console.log("Received request get all foods for Admin pageNo:", pageNo, "pageSize:", pageSize);

        const { count, rows } = await Food.findAndCountAll({
            limit: pageSize,
            offset: offset,
            order: [['created_at', 'DESC']]
        });

        console.log("Get all foods successfully");

        return res.status(200).json({
            success: true,
            message: "Get All Foods For Admin successfully",
            data: {
                pageNo,
                pageSize,
                totalPages: Math.ceil(count / pageSize),
                totalItems: count,
                items: rows
            }
        });

    } catch (error) {
        next(error);
    }
};


const getAllFoodsForUser = async (req, res, next) => {
    try {

        const pageNo = parseInt(req.query.pageNo) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (pageNo - 1) * pageSize;

        console.log("Received request get all foods for User pageNo:", pageNo, "pageSize:", pageSize);

        const { count, rows } = await Food.findAndCountAll({
            where: {
                is_deleted: false,
                is_available: true
            },
            limit: pageSize,
            offset: offset,
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            message: "Get Foods for User successfully",
            data: {
                pageNo,
                pageSize,
                totalPages: Math.ceil(count / pageSize),
                totalItems: count,
                items: rows
            }
        });

    } catch (error) {
        next(error);
    }
};




const updateFood = async (req, res, next) => {
    try {

        console.log("Received request to update food:", req.params.id);

        const food = await Food.findByPk(req.params.id);

        if (!food || food.is_deleted) {
            throw new AppError(404, "Food not found");
        }

        const {
            name,
            image_url,
            description,
            price,
            stock_quantity,
            is_available
        } = req.body;

        food.name = name || food.name;
        food.image_url = image_url || food.image_url;
        food.description = description || food.description;
        food.price = price || food.price;
        food.stock_quantity = stock_quantity ?? food.stock_quantity;
        food.is_available = is_available ?? food.is_available;

        await food.save();

        console.log("Update food:", req.params.id, "successfully");

        return res.status(200).json({
            success: true,
            message: "Update food successfully",
            data: {
                food
            }
        });

    } catch (error) {
        next(error);
    }
};



const deleteFood = async (req, res, next) => {
    try {

        const foodId = req.params.id;
        console.log("Received request to delete food:", foodId);

        const loggedInUser = req.user;

        const food = await Food.findOne({
            where: {
                id: foodId
            }
        });

        if (!food) {
            throw new AppError(404, "Food not found");
        }

        await food.update({
            is_deleted: true,
            updated_by: loggedInUser.id
        });

        console.log("Soft delete food:", foodId, "successfully");

        return res.status(200).json({
            success: true,
            message: "Delete food successfully"
        });

    } catch (error) {
        next(error);
    }
};



module.exports = {
    createFood,
    getFoodById,
    getAllFoodsForAdmin,
    getAllFoodsForUser,
    updateFood,
    deleteFood
};