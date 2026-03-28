const AppError = require("../utils/appError");
const xlsx = require("xlsx");
const fs = require("fs");
const sequelize = require('../config/database');
const Seat = require("../models/Seat");
const Showtime = require("../models/Showtime");
const ShowtimeSeat = require("../models/ShowtimeSeat");

const importSeatsFromExcel = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        console.log("importSeatsFromExcel file:", req.file?.filename);
        if (!req.file) throw new AppError(400, "No file");

        const wb = xlsx.readFile(req.file.path);
        const data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        
        if (data.length === 0) throw new AppError(400, "Empty");

        const ids = [...new Set(data.map(i => i.room_id))];
        console.log("Room IDs:", ids);

        await Seat.destroy({ where: { room_id: ids }, transaction: t });

        const list = data.map(i => ({
            room_id: i.room_id,
            row_label: i.row_label.toString().toUpperCase(),
            number: parseInt(i.number),
            type: i.type || 'standard',
            updated_by: req.user.id
        }));

        const result = await Seat.bulkCreate(list, { transaction: t });
        await t.commit();
        console.log("Import success:", result.length, "seats");

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        const map = result.reduce((a, s) => {
            if (!a[s.row_label]) a[s.row_label] = [];
            a[s.row_label].push({ id: s.id, number: s.number, type: s.type });
            return a;
        }, {});

        return res.status(201).json({ success: true, data: map });
    } catch (e) {
        console.error("Import error:", e.message);
        await t.rollback();
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        next(e);
    }
};
const updateSeatById = async (req, res, next) => {
    try {
        console.log("updateSeatById ID:", req.params.id);
        const s = await Seat.findByPk(req.params.id);
        if (!s || s.is_deleted) throw new AppError(404, "Not found");
        await s.update({ ...req.body, updated_by: req.user.id });
        return res.status(200).json({ success: true, data: s });
    } catch (e) { next(e); }
};
const createSeat = async (req, res, next) => {
    try {
        const { room_id, row_label, number, type } = req.body;

        if (!room_id || !row_label || !number) throw new AppError(400, "Missing fields");

        const row = row_label.toString().toUpperCase();
        const num = parseInt(number);

        const exists = await Seat.findOne({ where: { room_id, row_label: row, number: num, is_deleted: false } });
        if (exists) throw new AppError(400, "Seat exists");

        const data = await Seat.create({ ...req.body, row_label: row, number: num, updated_by: req.user.id });
        return res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
};
const deleteSeatById = async (req, res, next) => {
    try {
        console.log("deleteSeatById ID:", req.params.id);
        const s = await Seat.findByPk(req.params.id);
        if (!s || s.is_deleted) throw new AppError(404, "Not found");
        await s.update({ is_deleted: true, updated_by: req.user.id });
        return res.status(200).json({ success: true });
    } catch (e) { next(e); }
};

const getAllSeats = async (req, res, next) => {
    try {
        console.log("getAllSeats room_id:", req.query.room_id || "all");
        const { room_id, type } = req.query;
        const filter = { is_deleted: false };
        if (room_id) filter.room_id = room_id;
        if (type) filter.type = type;

        const list = await Seat.findAll({ 
            where: filter, 
            order: [['row_label', 'ASC'], ['number', 'ASC']] 
        });
        return res.status(200).json({ success: true, data: list });
    } catch (e) { next(e); }
};

const getSeatById = async (req, res, next) => {
    try {
        console.log("getSeatById ID:", req.params.id);
        const s = await Seat.findOne({ where: { id: req.params.id, is_deleted: false } });
        if (!s) throw new AppError(404, "Not found");
        return res.status(200).json({ success: true, data: s });
    } catch (e) { next(e); }
};
const getSeatMapByShowtime = async (req, res, next) => {
    try {
        const { showtime_id } = req.params;
        if (!showtime_id) throw new AppError(400, "Missing showtime_id");

        const showtime = await Showtime.findOne({ where: { id: showtime_id, is_deleted: false } });
        if (!showtime) throw new AppError(404, "Showtime not found");

        const seats = await Seat.findAll({ where: { room_id: showtime.room_id, is_deleted: false }, raw: true });
        const showtimeSeats = await ShowtimeSeat.findAll({ where: { showtime_id }, raw: true });
        const seatStatusMap = {};
        showtimeSeats.forEach(s => { seatStatusMap[s.seat_id] = s.status; });
        const map = {};
        seats.forEach(seat => {
            if (!map[seat.row_label]) map[seat.row_label] = [];
            map[seat.row_label].push({
                id: seat.id,
                number: seat.number,
                type: seat.type,
                status: seatStatusMap[seat.id] || "AVAILABLE"
            });
        });
        Object.values(map).forEach(row => row.sort((a, b) => a.number - b.number));

        return res.status(200).json({ success: true, data: map });
    } catch (e) { next(e); }
};

module.exports = { importSeatsFromExcel, createSeat, updateSeatById, deleteSeatById, getAllSeats, getSeatById, getSeatMapByShowtime };