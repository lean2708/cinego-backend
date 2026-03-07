const Cinema = require("../models/Cinema");
const Province = require("../models/Province");
const AppError = require("../utils/appError");
const getCinemasForUser = async (req, res, next) => {
    try {
        const { province_id } = req.query;
        console.log("getCinemasForUser province_id:", province_id || "all");

        const filter = { is_deleted: false };
        if (province_id) filter.province_id = province_id;

        const cinemas = await Cinema.findAll({
            where: filter,
            include: [{ model: Province, attributes: ['id', 'name'] }],
            order: [['name', 'ASC']]
        });

        return res.status(200).json({ success: true, results: cinemas.length, data: cinemas });
    } catch (error) { next(error); }
};
const getCinemasForAdmin = async (req, res, next) => {
    try {
        const { province_id } = req.query;
        console.log("getCinemasForAdmin province_id:", province_id || "all");

        const filter = {}; 
        if (province_id) filter.province_id = province_id;

        const cinemas = await Cinema.findAll({
            where: filter,
            include: [{ model: Province, attributes: ['id', 'name'] }],
            order: [['is_deleted', 'ASC'], ['name', 'ASC']]
        });

        return res.status(200).json({ success: true, results: cinemas.length, data: cinemas });
    } catch (error) { next(error); }
};

const addCinema = async (req, res, next) => {
    try {
        const newCinema = await Cinema.create({ ...req.body, updated_by: req.user.id });
        console.log("addCinema ID:", newCinema.id);
        return res.status(201).json({ success: true, data: newCinema });
    } catch (error) { next(error); }
};

const updateCinema = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("updateCinema ID:", id);
        const cinema = await Cinema.findByPk(id);
        if (!cinema) throw new AppError(404, "Không tìm thấy rạp");

        await cinema.update({ ...req.body, updated_by: req.user.id });
        return res.status(200).json({ success: true, data: cinema });
    } catch (error) { next(error); }
};

const deleteCinema = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("deleteCinema ID:", id);
        const cinema = await Cinema.findByPk(id);
        if (!cinema) throw new AppError(404, "Không tìm thấy rạp");

        await cinema.update({ is_deleted: true, updated_by: req.user.id });
        return res.status(200).json({ success: true });
    } catch (error) { next(error); }
};

const getCinemaById = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("getCinemaById ID:", id);
        const cinema = await Cinema.findOne({
            where: { id, is_deleted: false },
            include: [{ model: Province, attributes: ['id', 'name'] }]
        });
        if (!cinema) throw new AppError(404, "Không tìm thấy rạp");
        return res.status(200).json({ success: true, data: cinema });
    } catch (error) { next(error); }
};

module.exports = {
    addCinema,
    updateCinema,
    deleteCinema,
    getCinemasForUser,
    getCinemasForAdmin,
    getCinemaById
};