const Cinema = require("../models/Cinema");
const CinemaRoom = require("../models/CinemaRoom");
const Food = require("../models/Food");
const Genre = require("../models/Genre");
const Movie = require("../models/Movie");
const Order = require("../models/Order");
const OrderFood = require("../models/OrderFood");
const Seat = require("../models/Seat");
const Showtime = require("../models/Showtime");
const Ticket = require("../models/Ticket");
const UserVoucherUsage = require("../models/UserVoucherUsage");
const Voucher = require("../models/Voucher");
const { generateQRCode } = require("../utils/qrCodeHelper");





const getAllOrders = async (req, res, next) => {
    try {
        let { pageNo = 1, pageSize = 10, order_status } = req.query;

        pageNo = parseInt(pageNo);
        pageSize = parseInt(pageSize);

        const offset = (pageNo - 1) * pageSize;

        const whereCondition = {};
        if (order_status) {
            whereCondition.status = order_status;
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: Ticket,
                    as: 'tickets',
                    attributes: ['id', 'qr_code'],
                    include: [
                        {
                            model: Showtime,
                            as: 'showtime',
                            attributes: ['start_time'],
                            include: [
                                {
                                    model: Movie,
                                    as: 'movie',
                                    attributes: ['title', 'duration', 'poster_urls'],
                                    include: [
                                        {
                                            model: Genre,
                                            as: 'genres',
                                            attributes: ['name'],
                                            through: { attributes: [] }
                                        }
                                    ]
                                },
                                {
                                    model: CinemaRoom,
                                    as: 'room',
                                    attributes: ['id', 'name'],
                                    include: [
                                        {
                                            model: Cinema,
                                            as: 'cinema',
                                            attributes: ['id', 'name']
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: Seat,
                            as: 'seat',
                            attributes: ['row_label', 'number']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: pageSize,
            offset,
            distinct: true
        });

        const result = rows.map(order => {
            const tickets = order.tickets || [];

            const firstTicket = tickets[0];
            const showtime = firstTicket?.showtime;
            const movie = showtime?.movie;
            const room = showtime?.room;
            const cinema = room?.cinema;

            return {
                order_id: order.id,
                booking_code: order.booking_code,
                total_amount: order.total_amount,
                order_status: order.status,
                movie_name: movie?.title,
                genres: movie?.genres?.map(g => g.name),
                duration: movie?.duration,
                poster: movie?.poster_urls?.[0],
                showtime: showtime?.start_time,
                room: room?.name,
                cinema: cinema?.name,
                seats: tickets.map(t => `${t.seat?.row_label}${t.seat?.number}`),
                ticket_codes: tickets.map(t => t.qr_code)
            };
        });

        return res.status(200).json({
            success: true,
            message: "Get all orders successfully",
            data: {
                pageNo,
                pageSize,
                totalPages: Math.ceil(count / pageSize),
                totalItems: count,
                items: result
            }
        });

    } catch (error) {
        next(error);
    }
};


const getMyBookingHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        let { pageNo = 1, pageSize = 10, order_status } = req.query;

        pageNo = parseInt(pageNo);
        pageSize = parseInt(pageSize);

        const offset = (pageNo - 1) * pageSize;

        const whereCondition = {
            user_id: userId,
            is_deleted: false
        };

        if (order_status) {
            whereCondition.status = order_status;
        }

        const { count, rows } = await Order.findAndCountAll({
            where: whereCondition,
            include: [
                {
                    model: Ticket,
                    as: 'tickets',
                    attributes: ['id', 'qr_code'],
                    include: [
                        {
                            model: Showtime,
                            as: 'showtime',
                            attributes: ['start_time'],
                            include: [
                                {
                                    model: Movie,
                                    as: 'movie',
                                    attributes: ['title', 'duration', 'poster_urls'],
                                    include: [
                                        {
                                            model: Genre,
                                            as: 'genres',
                                            attributes: ['name'],
                                            through: { attributes: [] }
                                        }
                                    ]
                                },
                                {
                                    model: CinemaRoom,
                                    as: 'room',
                                    attributes: ['id', 'name'],
                                    include: [
                                        {
                                            model: Cinema,
                                            as: 'cinema',
                                            attributes: ['id', 'name']
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: Seat,
                            as: 'seat',
                            attributes: ['row_label', 'number']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']],
            limit: pageSize,
            offset: offset,
            distinct: true
        });

        // 🔥 FORMAT DATA


        const result = rows.map(order => {
            const tickets = order.tickets || [];

            if (tickets.length === 0) {
                return {
                    order_id: order.id,
                    booking_code: order.booking_code,
                    total_amount: order.total_amount,
                    payment_status: order.status,
                    seats: [],
                    ticket_codes: []
                };
            }

            // 👉 Lấy ticket đầu làm đại diện
            const firstTicket = tickets[0];
            const showtime = firstTicket.showtime;
            const movie = showtime?.movie;
            const room = showtime?.room;
            const cinema = room?.cinema;

            return {
                order_id: order.id,
                booking_code: order.booking_code,
                total_amount: order.total_amount,
                payment_status: order.status,

                movie_name: movie?.title,
                genres: movie?.genres?.map(g => g.name),
                duration: movie?.duration,
                poster: movie?.poster_urls?.[0],

                showtime: showtime?.start_time,
                room: room?.name,
                cinema: cinema?.name,

                // 👉 gộp ghế
                seats: tickets.map(t => `${t.seat?.row_label}${t.seat?.number}`),

                // 👉 gộp mã vé
                ticket_codes: tickets.map(t => t.qr_code)
            };
        });

        return res.status(200).json({
            success: true,
            success: true,
            message: "Get All Order History",
            data: {
                pageNo: pageNo,
                pageSize: pageSize,
                totalPages: Math.ceil(count / pageSize),
                totalItems: count,
                items: result
            }
        });

    } catch (error) {
        next(error);
    }
};



const getOrderDetailById = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const order = await Order.findOne({
            where: {
                id,
                user_id: userId,
                is_deleted: false
            },
            include: [
                {
                    model: Ticket,
                    as: 'tickets',
                    attributes: ['id', 'qr_code', 'price'],
                    include: [
                        {
                            model: Showtime,
                            as: 'showtime',
                            attributes: ['start_time'],
                            include: [
                                {
                                    model: Movie,
                                    as: 'movie',
                                    attributes: ['title', 'duration', 'poster_urls'],
                                    include: [
                                        {
                                            model: Genre,
                                            as: 'genres',
                                            attributes: ['name'],
                                            through: { attributes: [] }
                                        }
                                    ]
                                },
                                {
                                    model: CinemaRoom,
                                    as: 'room',
                                    attributes: ['name'],
                                    include: [
                                        {
                                            model: Cinema,
                                            as: 'cinema',
                                            attributes: ['name']
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            model: Seat,
                            as: 'seat',
                            attributes: ['row_label', 'number']
                        }
                    ]
                },
                {
                    model: OrderFood,
                    as: 'orderFoods',
                    attributes: ['quantity', 'price_at_purchase'],
                    include: [
                        {
                            model: Food,
                            as: 'food',
                            attributes: ['name', 'image_url']
                        }
                    ]
                },
                {
                    model: UserVoucherUsage,
                    as: 'voucherUsages',
                    attributes: ['used_at'],
                    include: [
                        {
                            model: Voucher,
                            as: 'voucher',
                            attributes: ['code', 'value', 'type']
                        }
                    ]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const qrCodeImage = await generateQRCode(order.booking_code);

        const tickets = order.tickets || [];
        const firstTicket = tickets[0];

        const showtime = firstTicket?.showtime;
        const movie = showtime?.movie;
        const room = showtime?.room;
        const cinema = room?.cinema;

        // Ticket
        const seats = tickets.map(t => `${t.seat?.row_label}${t.seat?.number}`);
        const ticketPrices = tickets.map(t => t.price);

        //  Food
        const foods = (order.orderFoods || []).map(item => ({
            name: item.food?.name,
            image: item.food?.image_url,
            quantity: item.quantity,
            price: item.price_at_purchase,
            total: item.quantity * item.price_at_purchase
        }));

        //  Voucher
        const voucher = order.voucherUsages?.[0]?.voucher || null;

        const result = {
            order_id: order.id,
            booking_code: order.booking_code,
            payment_status: order.status,
            qr_code_url: qrCodeImage,

            // Movie
            movie_name: movie?.title,
            genres: movie?.genres?.map(g => g.name),
            duration: movie?.duration,
            poster: movie?.poster_urls?.[0],

            // Showtime
            showtime: showtime?.start_time,
            room: room?.name,
            cinema: cinema?.name,

            // Ticket
            seats,
            ticket_codes: tickets.map(t => t.qr_code),
            ticket_prices: ticketPrices,
            ticket_quantity: tickets.length,
            ticket_total: order.ticket_total,

            // Food
            foods,
            food_total: order.food_total,

            // Discount
            voucher: voucher
                ? {
                    code: voucher.code,
                    value: voucher.value,
                    type: voucher.type
                }
                : null,
            discount: order.discount_applied,

            // Total
            total_amount: order.total_amount
        };

        return res.status(200).json({
            success: true,
            message: "Get order detail successfully",
            data: result
        });

    } catch (error) {
        next(error);
    }
};


const checkInAllTickets = async (req, res, next) => {
    try {
        const { booking_code } = req.body;

        const order = await Order.findOne({
            where: { booking_code },
            include: [{ model: Ticket, as: 'tickets' }]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        let count = 0;

        for (let ticket of order.tickets) {
            if (!ticket.is_used) {
                ticket.is_used = true;
                await ticket.save();
                count++;
            }
        }

        return res.json({
            success: true,
            message: `Checked-in ${count} tickets`
        });

    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAllOrders,
    getMyBookingHistory,
    getOrderDetailById,
    checkInAllTickets
}