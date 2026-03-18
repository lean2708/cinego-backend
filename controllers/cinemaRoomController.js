const sequelize = require('../config/database');
const CinemaRoom = require('../models/CinemaRoom');
const Cinema = require('../models/Cinema');
const AppError = require('../utils/appError');

const getCinemaRooms = async (req, res, next) => {
  try {
    const { cinema_id } = req.query;
    const filter = { is_deleted: false };
    if (cinema_id) filter.cinema_id = cinema_id;

    const list = await CinemaRoom.findAll({ 
      where: filter, 
      order: [['name', 'ASC']] 
    });
    return res.status(200).json({ success: true, results: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

const getCinemaRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await CinemaRoom.findOne({ where: { id, is_deleted: false } });
    if (!room) throw new AppError(404, 'Không tìm thấy phòng chiếu');
    return res.status(200).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
};

const addCinemaRoom = async (req, res, next) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const { cinema_id, name } = req.body;

      if (!cinema_id || !name) {
        throw new AppError(400, 'Thiếu trường cinema_id hoặc name');
      }

      const cinema = await Cinema.findOne({ 
        where: { id: cinema_id, is_deleted: false },
        transaction: t 
      });
      if (!cinema) {
        throw new AppError(404, 'Rạp không tồn tại');
      }

      const exists = await CinemaRoom.findOne({
        where: { cinema_id, name, is_deleted: false },
        transaction: t
      });
      if (exists) {
        throw new AppError(400, 'Phòng chiếu đã tồn tại trong rạp này');
      }

      const newRoom = await CinemaRoom.create({
        cinema_id,
        name,
        updated_by: req.user?.id || null,
      }, { transaction: t });

      return newRoom;
    });

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const updateCinemaRoom = async (req, res, next) => {
  try {
    const result = await sequelize.transaction(async (t) => {
      const { id } = req.params;
      const { cinema_id } = req.body;

      const room = await CinemaRoom.findOne({ 
        where: { id, is_deleted: false },
        transaction: t
      });
      if (!room) throw new AppError(404, 'Không tìm thấy phòng chiếu');

      if (cinema_id) {
        const cinema = await Cinema.findOne({ 
          where: { id: cinema_id, is_deleted: false },
          transaction: t
        });
        if (!cinema) throw new AppError(404, 'Rạp không tồn tại');
      }

      await room.update({ 
        ...req.body, 
        updated_by: req.user?.id || null 
      }, { transaction: t });

      return room;
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const deleteCinemaRoom = async (req, res, next) => {
  try {
    await sequelize.transaction(async (t) => {
      const { id } = req.params;
      const room = await CinemaRoom.findOne({ 
        where: { id, is_deleted: false },
        transaction: t
      });
      if (!room) throw new AppError(404, 'Không tìm thấy phòng chiếu');

      await room.update({ 
        is_deleted: true, 
        updated_by: req.user?.id || null 
      }, { transaction: t });
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCinemaRooms,
  getCinemaRoomById,
  addCinemaRoom,
  updateCinemaRoom,
  deleteCinemaRoom,
};