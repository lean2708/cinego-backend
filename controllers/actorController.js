const Actor = require("../models/Actor");
const AppError = require("../utils/appError");
const { Op } = require("sequelize");
const sequelize = require("../config/database");



const createActor = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        console.log("Received a request to create actor");

        const { name, image_url } = req.body;

        if (!name) {
            throw new AppError(400, "Please provide actor name");
        }

        const existingActor = await Actor.findOne({
            where: { name }
        });

        if (existingActor) {
            throw new AppError(409, "Actor already exists");
        }

        const actor = await Actor.create({
            name,
            image_url: image_url || null
        }, { transaction });

        await transaction.commit();

        console.log("Create actor:", actor.id, "successfully");

        return res.status(201).json({
            success: true,
            message: "Create actor successfully",
            data: { actor }
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


const getAllActors = async (req, res, next) => {
    try {
        const pageNo = parseInt(req.query.pageNo) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const offset = (pageNo - 1) * pageSize;

        const { name } = req.query;

        console.log("Received a request to get all actors");

        // điều kiện where
        const whereCondition = {};

        if (name) {
            whereCondition.name = {
                [Op.iLike]: `%${name}%`
            };
        }

        const { count, rows } = await Actor.findAndCountAll({
            where: whereCondition,
            limit: pageSize,
            offset,
            order: [['id', 'DESC']]
        });

        console.log("Get all actors successfully");

        return res.status(200).json({
            success: true,
            message: "Get all actors successfully",
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


const getActorById = async (req, res, next) => {
    try {
        console.log("Received a request to get actor by id:", req.params.id);

        const actor = await Actor.findByPk(req.params.id);

        if (!actor) {
            throw new AppError(404, "Actor not found");
        }

        console.log("Get actor by id:", req.params.id, "successfully");

        return res.status(200).json({
            success: true,
            message: "Get actor by id successfully",
            data: { actor }
        });

    } catch (error) {
        next(error);
    }
};



const updateActor = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        console.log("Received a request to update actor:", req.params.id);

        const actor = await Actor.findByPk(req.params.id);

        if (!actor) {
            throw new AppError(404, "Actor not found");
        }

        const { name, image_url } = req.body;

        if (name) {
            // check duplicate
            const existingActor = await Actor.findOne({
                where: {
                    name,
                    id: { [Op.ne]: actor.id }
                }
            });

            if (existingActor) {
                throw new AppError(409, "Actor name already exists");
            }

            actor.name = name;
        }

        if (image_url !== undefined) {
            actor.image_url = image_url;
        }

        await actor.save({ transaction });

        await transaction.commit();

        console.log("Update actor:", req.params.id, "successfully");

        return res.status(200).json({
            success: true,
            message: "Update actor successfully",
            data: { actor }
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};



const deleteActor = async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
        console.log("Received a request to delete actor:", req.params.id);

        const actor = await Actor.findByPk(req.params.id);

        if (!actor) {
            throw new AppError(404, "Actor not found");
        }

        await actor.destroy({ transaction });

        await transaction.commit();

        console.log("Delete actor:", req.params.id, "successfully");

        return res.status(200).json({
            success: true,
            message: "Delete actor successfully"
        });

    } catch (error) {
        await transaction.rollback();
        next(error);
    }
};


module.exports = {
    createActor,
    getAllActors,
    getActorById,
    updateActor,
    deleteActor
};