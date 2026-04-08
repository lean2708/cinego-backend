const sequelize = require('../config/database');
const { Op } = require('sequelize');
const Order = require('../models/Order');
const Ticket = require('../models/Ticket');
const OrderFood = require('../models/OrderFood');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Showtime = require('../models/Showtime');
const AppError = require('../utils/appError');

// 1. Get summary statistics
const getSummaryStats = async (req, res, next) => {
    try {
        // Lấy năm hiện tại hoặc từ query
        const year = Math.max(1900, Math.min(parseInt(req.query.year) || new Date().getFullYear(), 2100));
        const startOfYear = new Date(`${year}-01-01`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

        // 1. Tính tổng doanh thu vé
        const ticketRevenue = await Order.sum('ticket_total', {
            where: {
                status: 'SUCCESS',
                createdAt: {
                    [Op.between]: [startOfYear, endOfYear]
                }
            }
        }) || 0;

        // 2. Tính tổng doanh thu F&B
        const foodRevenue = await Order.sum('food_total', {
            where: {
                status: 'SUCCESS',
                createdAt: {
                    [Op.between]: [startOfYear, endOfYear]
                }
            }
        }) || 0;

        // 3. Đếm tổng vé bán ra
        const totalTicketsSold = await Ticket.count({
            include: [{
                model: Order,
                where: {
                    status: 'SUCCESS',
                    createdAt: {
                        [Op.between]: [startOfYear, endOfYear]
                    }
                },
                required: true
            }]
        });

        // 4. Đếm người dùng mới trong năm
        const newUsers = await User.count({
            where: {
                createdAt: {
                    [Op.between]: [startOfYear, endOfYear]
                }
            }
        });

        // 5. Tính % thay đổi so với năm trước
        const prevStartOfYear = new Date(`${year - 1}-01-01`);
        const prevEndOfYear = new Date(`${year - 1}-12-31T23:59:59.999Z`);

        const prevTicketRevenue = await Order.sum('ticket_total', {
            where: {
                status: 'SUCCESS',
                createdAt: {
                    [Op.between]: [prevStartOfYear, prevEndOfYear]
                }
            }
        }) || 0;

        const prevFoodRevenue = await Order.sum('food_total', {
            where: {
                status: 'SUCCESS',
                createdAt: {
                    [Op.between]: [prevStartOfYear, prevEndOfYear]
                }
            }
        }) || 0;

        const prevTicketsSold = await Ticket.count({
            include: [{
                model: Order,
                where: {
                    status: 'SUCCESS',
                    createdAt: {
                        [Op.between]: [prevStartOfYear, prevEndOfYear]
                    }
                },
                required: true
            }]
        });

        const prevNewUsers = await User.count({
            where: {
                createdAt: {
                    [Op.between]: [prevStartOfYear, prevEndOfYear]
                }
            }
        });

        // Tính % thay đổi
        const ticketRevenueChange = prevTicketRevenue > 0 
            ? ((ticketRevenue - prevTicketRevenue) / prevTicketRevenue * 100).toFixed(2)
            : (ticketRevenue > 0 ? "100.00" : "0.00");

        const foodRevenueChange = prevFoodRevenue > 0 
            ? ((foodRevenue - prevFoodRevenue) / prevFoodRevenue * 100).toFixed(2)
            : (foodRevenue > 0 ? "100.00" : "0.00");

        const ticketsSoldChange = prevTicketsSold > 0 
            ? ((totalTicketsSold - prevTicketsSold) / prevTicketsSold * 100).toFixed(2)
            : (totalTicketsSold > 0 ? "100.00" : "0.00");

        const newUsersChange = prevNewUsers > 0 
            ? ((newUsers - prevNewUsers) / prevNewUsers * 100).toFixed(2)
            : (newUsers > 0 ? "100.00" : "0.00");

        const totalRevenue = ticketRevenue + foodRevenue;

        res.status(200).json({
            status: 'success',
            data: {
                totalRevenue: Math.round(totalRevenue),
                ticketRevenue: Math.round(ticketRevenue),
                foodRevenue: Math.round(foodRevenue),
                totalTicketsSold,
                newUsers,
                changes: {
                    ticketRevenue: `${ticketRevenueChange}%`,
                    foodRevenue: `${foodRevenueChange}%`,
                    totalTicketsSold: `${ticketsSoldChange}%`,
                    newUsers: `${newUsersChange}%`
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 2. Get monthly revenue chart data
const getMonthlyRevenueChart = async (req, res, next) => {
    try {
        const year = Math.max(1900, Math.min(parseInt(req.query.year) || new Date().getFullYear(), 2100));

        const monthlyData = await sequelize.query(`
            SELECT 
                MONTH(o."created_at") as month,
                COALESCE(SUM(o."ticket_total" + o."food_total"), 0) as revenue
            FROM "Orders" o
            WHERE o."status" = 'SUCCESS'
                AND YEAR(o."created_at") = :year
            GROUP BY MONTH(o."created_at")
            ORDER BY MONTH(o."created_at")
        `, {
            replacements: { year },
            type: sequelize.QueryTypes.SELECT
        });

        // Fill in missing months with 0
        const chartData = Array(12).fill(0);
        monthlyData.forEach(data => {
            chartData[data.month - 1] = Math.round(data.revenue) || 0;
        });

        const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

        res.status(200).json({
            status: 'success',
            data: {
                months,
                revenue: chartData,
                total: chartData.reduce((sum, val) => sum + val, 0)
            }
        });
    } catch (error) {
        next(error);
    }
};

// 3. Get latest bookings
const getLatestBookings = async (req, res, next) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

        const latestBookings = await Ticket.findAll({
            attributes: ['id', 'price', 'ticket_status', 'createdAt'],
            include: [
                {
                    model: Order,
                    attributes: ['id', 'booking_code', 'status'],
                    where: { status: 'SUCCESS' },
                    required: true,
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'full_name', 'phone'],
                            required: true
                        }
                    ]
                },
                {
                    model: Showtime,
                    attributes: ['id', 'base_price'],
                    required: true,
                    include: [
                        {
                            model: Movie,
                            attributes: ['id', 'title'],
                            required: true
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            subQuery: false
        });

        const formattedBookings = latestBookings.map(ticket => ({
            ticketId: `#TK-${ticket.id}`,
            bookingCode: ticket.Order.booking_code,
            customerName: ticket.Order.User.full_name,
            movieTitle: ticket.Showtime.Movie.title,
            time: new Date(ticket.createdAt).toLocaleTimeString('vi-VN'),
            date: new Date(ticket.createdAt).toLocaleDateString('vi-VN'),
            status: ticket.Order.status === 'SUCCESS' ? 'Thành công' : 'Chưa thanh toán',
            statusType: ticket.Order.status === 'SUCCESS' ? 'success' : 'pending'
        }));

        res.status(200).json({
            status: 'success',
            data: formattedBookings
        });
    } catch (error) {
        next(error);
    }
};

// 4. Get top grossing movies
const getTopGrossingMovies = async (req, res, next) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 20);
        const year = Math.max(1900, Math.min(parseInt(req.query.year) || new Date().getFullYear(), 2100));

        const topMovies = await sequelize.query(`
            SELECT 
                m."id",
                m."title",
                m."poster_urls",
                COALESCE(SUM(o."ticket_total"), 0) as revenue,
                COUNT(t."id") as tickets_sold
            FROM "Tickets" t
            JOIN "Orders" o ON t."order_id" = o."id"
            JOIN "Showtimes" s ON t."showtime_id" = s."id"
            JOIN "Movies" m ON s."movie_id" = m."id"
            WHERE o."status" = 'SUCCESS'
                AND YEAR(o."created_at") = :year
            GROUP BY m."id", m."title", m."poster_urls"
            ORDER BY revenue DESC
            LIMIT :limit
        `, {
            replacements: { year, limit },
            type: sequelize.QueryTypes.SELECT
        });

        const formattedMovies = topMovies.map((movie, index) => ({
            rank: index + 1,
            id: movie.id,
            title: movie.title,
            poster: movie.poster_urls ? (Array.isArray(movie.poster_urls) ? movie.poster_urls[0] : movie.poster_urls) : null,
            revenue: Math.round(movie.revenue),
            ticketsSold: movie.tickets_sold
        }));

        res.status(200).json({
            status: 'success',
            data: formattedMovies
        });
    } catch (error) {
        next(error);
    }
};

// 5. Get top cinemas by booking count
const getTopCinemasByBookings = async (req, res, next) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 5, 1), 20);
        const year = Math.max(1900, Math.min(parseInt(req.query.year) || new Date().getFullYear(), 2100));

        const topCinemas = await sequelize.query(`
            SELECT 
                c."id",
                c."name",
                c."image_urls",
                COUNT(DISTINCT t."id") as total_bookings,
                COALESCE(SUM(o."ticket_total" + o."food_total"), 0) as total_revenue
            FROM "Tickets" t
            JOIN "Orders" o ON t."order_id" = o."id"
            JOIN "Showtimes" s ON t."showtime_id" = s."id"
            JOIN "CinemaRooms" cr ON s."room_id" = cr."id"
            JOIN "Cinemas" c ON cr."cinema_id" = c."id"
            WHERE o."status" = 'SUCCESS'
                AND YEAR(o."created_at") = :year
            GROUP BY c."id", c."name", c."image_urls"
            ORDER BY total_bookings DESC
            LIMIT :limit
        `, {
            replacements: { year, limit },
            type: sequelize.QueryTypes.SELECT
        });

        const formattedCinemas = topCinemas.map((cinema, index) => ({
            rank: index + 1,
            id: cinema.id,
            name: cinema.name,
            logo: cinema.image_urls ? (Array.isArray(cinema.image_urls) ? cinema.image_urls[0] : cinema.image_urls) : null,
            totalBookings: cinema.total_bookings,
            totalRevenue: Math.round(cinema.total_revenue)
        }));

        res.status(200).json({
            status: 'success',
            data: formattedCinemas
        });
    } catch (error) {
        next(error);
    }
};

// 6. Get all dashboard data at once
const getDashboardData = async (req, res, next) => {
    try {
        const year = Math.max(1900, Math.min(parseInt(req.query.year) || new Date().getFullYear(), 2100));
        const startOfYear = new Date(`${year}-01-01`);
        const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

        // Get all data in parallel
        const [summaryStats, monthlyRevenue, latestBookings, topMovies, topCinemas] = await Promise.all([
            // Summary stats
            (async () => {

                const ticketRevenue = await Order.sum('ticket_total', {
                    where: {
                        status: 'SUCCESS',
                        createdAt: { [Op.between]: [startOfYear, endOfYear] }
                    }
                }) || 0;

                const foodRevenue = await Order.sum('food_total', {
                    where: {
                        status: 'SUCCESS',
                        createdAt: { [Op.between]: [startOfYear, endOfYear] }
                    }
                }) || 0;

                const totalTicketsSold = await Ticket.count({
                    include: [{
                        model: Order,
                        where: {
                            status: 'SUCCESS',
                            createdAt: { [Op.between]: [startOfYear, endOfYear] }
                        },
                        required: true
                    }]
                });

                const newUsers = await User.count({
                    where: {
                        createdAt: { [Op.between]: [startOfYear, endOfYear] }
                    }
                });

                return {
                    totalRevenue: Math.round(ticketRevenue + foodRevenue),
                    ticketRevenue: Math.round(ticketRevenue),
                    foodRevenue: Math.round(foodRevenue),
                    totalTicketsSold,
                    newUsers
                };
            })(),

            // Monthly revenue
            (async () => {
                const monthlyData = await sequelize.query(`
                    SELECT 
                        MONTH(o."created_at") as month,
                        COALESCE(SUM(o."ticket_total" + o."food_total"), 0) as revenue
                    FROM "Orders" o
                    WHERE o."status" = 'SUCCESS'
                        AND o."created_at" >= :startDate
                        AND o."created_at" <= :endDate
                    GROUP BY MONTH(o."created_at")
                    ORDER BY MONTH(o."created_at")
                `, {
                    replacements: { startDate: startOfYear, endDate: endOfYear },
                    type: sequelize.QueryTypes.SELECT
                });

                const chartData = Array(12).fill(0);
                monthlyData.forEach(data => {
                    chartData[data.month - 1] = Math.round(data.revenue) || 0;
                });

                return chartData;
            })(),

            // Latest bookings
            (async () => {
                const bookings = await Ticket.findAll({
                    attributes: ['id', 'price', 'ticket_status', 'createdAt'],
                    include: [
                        {
                            model: Order,
                            attributes: ['id', 'booking_code', 'status'],
                            where: { status: 'SUCCESS' },
                            required: true,
                            include: [{ model: User, attributes: ['full_name'], required: true }]
                        },
                        {
                            model: Showtime,
                            attributes: ['base_price'],
                            required: true,
                            include: [{ model: Movie, attributes: ['title'], required: true }]
                        }
                    ],
                    order: [['createdAt', 'DESC']],
                    limit: 10,
                    subQuery: false
                });

                return bookings.map(ticket => ({
                    ticketId: `#TK-${ticket.id}`,
                    bookingCode: ticket.Order.booking_code,
                    customerName: ticket.Order.User.full_name,
                    movieTitle: ticket.Showtime.Movie.title,
                    time: new Date(ticket.createdAt).toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit'
                    }),
                    status: 'Thành công'
                }));
            })(),

            // Top movies
            (async () => {
                const movies = await sequelize.query(`
                    SELECT 
                        m."id",
                        m."title",
                        m."poster_urls",
                        COALESCE(SUM(o."ticket_total"), 0) as revenue
                    FROM "Tickets" t
                    JOIN "Orders" o ON t."order_id" = o."id"
                    JOIN "Showtimes" s ON t."showtime_id" = s."id"
                    JOIN "Movies" m ON s."movie_id" = m."id"
                    WHERE o."status" = 'SUCCESS'
                        AND o."created_at" >= :startDate
                        AND o."created_at" <= :endDate
                    GROUP BY m."id", m."title", m."poster_urls"
                    ORDER BY revenue DESC
                    LIMIT 5
                `, {
                    replacements: { startDate: startOfYear, endDate: endOfYear },
                    type: sequelize.QueryTypes.SELECT
                });

                return movies.map((movie, index) => ({
                    rank: index + 1,
                    title: movie.title,
                    poster: movie.poster_urls ? (Array.isArray(movie.poster_urls) ? movie.poster_urls[0] : movie.poster_urls) : null,
                    revenue: Math.round(movie.revenue)
                }));
            })(),

            // Top cinemas
            (async () => {
                const cinemas = await sequelize.query(`
                    SELECT 
                        c."id",
                        c."name",
                        c."image_urls",
                        COUNT(DISTINCT t."id") as total_bookings
                    FROM "Tickets" t
                    JOIN "Orders" o ON t."order_id" = o."id"
                    JOIN "Showtimes" s ON t."showtime_id" = s."id"
                    JOIN "CinemaRooms" cr ON s."room_id" = cr."id"
                    JOIN "Cinemas" c ON cr."cinema_id" = c."id"
                    WHERE o."status" = 'SUCCESS'
                        AND o."created_at" >= :startDate
                        AND o."created_at" <= :endDate
                    GROUP BY c."id", c."name", c."image_urls"
                    ORDER BY total_bookings DESC
                    LIMIT 5
                `, {
                    replacements: { startDate: startOfYear, endDate: endOfYear },
                    type: sequelize.QueryTypes.SELECT
                });

                return cinemas.map((cinema, index) => ({
                    rank: index + 1,
                    name: cinema.name,
                    logo: cinema.image_urls ? (Array.isArray(cinema.image_urls) ? cinema.image_urls[0] : cinema.image_urls) : null,
                    bookings: cinema.total_bookings
                }));
            })()
        ]);

        const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

        res.status(200).json({
            status: 'success',
            data: {
                summary: summaryStats,
                monthlyChart: {
                    months,
                    revenue: monthlyRevenue
                },
                latestBookings,
                topMovies,
                topCinemas
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getSummaryStats,
    getMonthlyRevenueChart,
    getLatestBookings,
    getTopGrossingMovies,
    getTopCinemasByBookings,
    getDashboardData
};
