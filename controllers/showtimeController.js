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

      const showtime = await Showtime.create({
        movie_id,
        room_id,
        start_time: startTime,
        end_time: endTime,
        base_price
      },{ transaction });

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



const updateShowtime = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { movie_id, room_id, start_time, base_price } = req.body;

    if (isNaN(id)) {
      throw new AppError(400, "Invalid showtime id");
    }

    const showtime = await Showtime.findOne({
      where: {
        id,
        is_deleted: false
      },
      transaction
    });

    if (!showtime) {
      throw new AppError(404, "Showtime not found");
    }

    const nextMovieId = movie_id ?? showtime.movie_id;
    const nextRoomId = room_id ?? showtime.room_id;
    const nextBasePrice = base_price ?? showtime.base_price;
    const nextStartTime = start_time ? new Date(start_time) : new Date(showtime.start_time);

    if (isNaN(nextStartTime.getTime())) {
      throw new AppError(400, "Invalid start_time");
    }

    const movie = await Movie.findOne({
      where: {
        id: nextMovieId,
        is_deleted: false
      },
      transaction
    });

    if (!movie) {
      throw new AppError(404, "Movie not found");
    }

    const room = await CinemaRoom.findOne({
      where: {
        id: nextRoomId,
        is_deleted: false
      }
    });

    if (!room) {
      throw new AppError(404, "Cinema room not found");
    }

    const nextEndTime = new Date(
      nextStartTime.getTime() +
        (movie.duration + CLEANUP_MINUTES) * 60 * 1000
    );

    const conflict = await Showtime.findOne({
      where: {
        id: {
          [Op.ne]: id
        },
        room_id: nextRoomId,
        is_deleted: false,
        start_time: {
          [Op.lt]: nextEndTime
        },
        end_time: {
          [Op.gt]: nextStartTime
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

    await showtime.update({
        movie_id: nextMovieId,
        room_id: nextRoomId,
        start_time: nextStartTime,
        end_time: nextEndTime,
        base_price: nextBasePrice,
        updated_by: req.user?.id || null
    },{ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Update showtime successfully",
      data: {
        showtime
      }
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};



const deleteShowtime = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    if (isNaN(id)) {
      throw new AppError(400, "Invalid showtime id");
    }

    const showtime = await Showtime.findOne({
      where: {
        id,
        is_deleted: false
      },
      transaction
    });

    if (!showtime) {
      throw new AppError(404, "Showtime not found");
    }

    await showtime.update({
        is_deleted: true,
        updated_by: req.user?.id || null
    },{ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Delete showtime successfully"
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};



const getShowtimesByMovieCinemaDate = async (req, res, next) => {
  try {
    const { movie_id, cinema_id, date } = req.query;

    if (!movie_id || !cinema_id || !date) {
      throw new AppError(
        400,
        "movie_id, cinema_id and date are required"
      );
    }

    // xác định thời gian đầu ngày và cuối ngày
    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59`);

    const showtimes = await Showtime.findAll({
      attributes: {
        exclude: ["room_id", "movie_id"] 
      },
      where: {
        movie_id,
        is_deleted: false,
        start_time: {
          [Op.between]: [startOfDay, endOfDay]
        }
      },
      include: [
        {
          model: CinemaRoom,
          as: "room",
          where: {
            cinema_id,
            is_deleted: false
          },
          attributes: ["id", "name"]
        },
        {
          model: Movie,
          as: "movie",
          attributes: ["id", "title", "duration"]
        }
      ],
      order: [["start_time", "ASC"]]
    });

    return res.status(200).json({
      success: true,
      data: {
        showtimes
      }
    });

  } catch (error) {
    next(error);
  }
};



module.exports = {
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getShowtimesByMovieCinemaDate
};