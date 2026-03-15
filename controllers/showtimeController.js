const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Movie = require("../models/Movie");
const CinemaRoom = require("../models/CinemaRoom");
const Showtime = require("../models/Showtime");
const AppError = require("../utils/appError");



const CLEANUP_MINUTES = 30;



const normalizeStartTimes = (startTimesInput) => {
  if (!Array.isArray(startTimesInput)) {
    return [startTimesInput];
  }
  return startTimesInput;
};




const createShowtime = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { movie_id, room_id, start_times, base_price } = req.body;

    if (!movie_id || !room_id || !start_times || !base_price) {
      throw new AppError(
        400,
        "movie_id, room_id, start_times, base_price are required"
      );
    }

    console.log("Received request create showtime");

    // check movie
    const movie = await Movie.findOne({
      where: { id: movie_id, is_deleted: false },
      transaction
    });

    if (!movie) {
      throw new AppError(404, "Movie not found");
    }

    // check room
    const room = await CinemaRoom.findOne({
      where: { id: room_id, is_deleted: false },
      transaction
    });

    if (!room) {
      throw new AppError(404, "Cinema room not found");
    }

    const startTimes = normalizeStartTimes(start_times);

    const createdShowtimes = [];

    for (const start of startTimes) {
      const startTime = new Date(start);

      if (isNaN(startTime.getTime())) {
        throw new AppError(400, `Invalid start_time: ${start}`);
      }

      // tính end_time (movie duration + cleanup)
      const endTime = new Date(
        startTime.getTime() +
          (movie.duration + CLEANUP_MINUTES) * 60 * 1000
      );

      // check conflict chuẩn
      const conflict = await Showtime.findOne({
        where: {
          room_id,
          is_deleted: false,
          start_time: {
            [Op.lt]: endTime
          },
          end_time: {
            [Op.gt]: startTime
          }
        },
        transaction
      });

      if (conflict) {
        throw new AppError(
          409,
          `Showtime conflict with existing showtime ID ${conflict.id}`
        );
      }

      const showtime = await Showtime.create(
        {
          movie_id,
          room_id,
          start_time: startTime,
          end_time: endTime,
          base_price
        },
        { transaction }
      );

      createdShowtimes.push(showtime);
    }

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Create showtime successfully",
      data: {
        showtimes: createdShowtimes
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  createShowtime
};