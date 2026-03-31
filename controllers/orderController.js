const AppError = require("../utils/appError");
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
const User = require("../models/User");
const UserVoucherUsage = require("../models/UserVoucherUsage");
const Voucher = require("../models/Voucher");
const { generateQRCode } = require("../utils/qrCodeHelper");
const sequelize = require("../config/database");
const { createPaymentUrl } = require("../utils/vnpay");
const ShowtimeSeat = require("../models/ShowtimeSeat");



const createOrder = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user.id;
        const { showtimeId, seatIds = [], foodItems = [], voucher_code } = req.body;

        if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
            throw new AppError(400, "Please select a showtime and seats");
        }

        const SEAT_PRICE_MULTIPLIER = {
            STANDARD: 1,
            VIP: 1.5,
            COUPLE: 2
        };

        // 1. Check seats exist
        const showtimeSeats = await ShowtimeSeat.findAll({
            where: { showtime_id: showtimeId, seat_id: seatIds, status: "AVAILABLE" },
            transaction: t
        });

        if (showtimeSeats.length !== seatIds.length) {
            throw new AppError(400, "Some selected seats do not exist");
        }

        // 2. Get showtime
        const showtime = await Showtime.findByPk(showtimeId, { transaction: t });
        if (!showtime) throw new AppError(400, "Showtime not found");

        // 3. Get seats
        const seats = await Seat.findAll({
            where: { id: seatIds, is_deleted: false },
            transaction: t
        });

        if (seats.length !== seatIds.length) {
            throw new AppError(400, "Some seats are invalid or deleted");
        }

        // 4. Calculate ticket price
        let ticket_total = 0;
        const ticketDetails = [];

        seats.forEach(seat => {
            const basePrice = showtime.base_price;
            const multiplier = SEAT_PRICE_MULTIPLIER[seat.type] || 1;
            const finalPrice = Math.round(basePrice * multiplier);

            ticket_total += finalPrice;

            ticketDetails.push({
                seat_id: seat.id,
                price: finalPrice
            });
        });

        // 5. Calculate food price (NO stock deduction)
        let food_total = 0;
        const foodDetails = [];

        for (const item of foodItems) {
            const { foodId, quantity } = item;

            if (!foodId || !quantity || quantity <= 0) {
                throw new AppError(400, "Invalid food item");
            }

            const food = await Food.findOne({
                where: { id: foodId, is_deleted: false },
                transaction: t
            });

            if (!food || !food.is_available) {
                throw new AppError(400, `Food item ${foodId} is not available`);
            }

            const total = food.price * quantity;
            food_total += total;

            foodDetails.push({
                food_id: food.id,
                quantity,
                price: food.price
            });
        }

        // 6. Voucher (calculation only)
        let discount = 0;
        let voucher = null;

        if (voucher_code) {
            voucher = await Voucher.findOne({
                where: { code: voucher_code, is_deleted: false },
                transaction: t
            });

            if (!voucher) throw new AppError(404, "Voucher not found");
            if (!voucher.is_active) throw new AppError(400, "Voucher is inactive");

            const now = new Date();
            if (now < new Date(voucher.start_date) || now > new Date(voucher.end_date)) {
                throw new AppError(400, "Voucher is expired or not valid yet");
            }

            if (voucher.type === "PERCENT") {
                discount = Math.round((voucher.value / 100) * (ticket_total + food_total));
            } else {
                discount = Math.min(voucher.value, ticket_total + food_total);
            }
        }

        const total_amount = Math.max(ticket_total + food_total - discount, 0);

        // 7. Create order
        const booking_code = `BK${Date.now()}`;

        const order = await Order.create({
            user_id: userId,
            booking_code,
            status: "PENDING",
            payment_method: "VNPAY",
            ticket_total,
            food_total,
            discount_applied: discount,
            total_amount,
        }, { transaction: t });

        // 8. Create tickets
        for (const item of ticketDetails) {
            await Ticket.create({
                order_id: order.id,
                showtime_id: showtimeId,
                seat_id: item.seat_id,
                price: item.price,
                ticket_status: "PENDING"
            }, { transaction: t });
        }

        // 9. Save order food
        for (const item of foodDetails) {
            await OrderFood.create({
                order_id: order.id,
                food_id: item.food_id,
                quantity: item.quantity,
                price_at_purchase: item.price
            }, { transaction: t });
        }

        // 10. Create VNPay URL
        const paymentUrl = createPaymentUrl(req, order);

        await t.commit();

        return res.status(201).json({
            success: true,
            message: "Order created successfully. Redirecting to payment gateway",
            data: {
                order_id: order.id,
                booking_code: order.booking_code,
                payment_url: paymentUrl
            }
        });

    } catch (error) {
        await t.rollback();
        next(error);
    }
};




const checkoutOrder = async (req, res, next) => {
    try {
        const { showtimeId, seatIds = [], foodItems = [], voucher_code } = req.body;

        if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
            throw new AppError(400, "Vui lòng chọn suất chiếu và ghế");
        }

        // CONFIG giá ghế
        const SEAT_PRICE_MULTIPLIER = {
            STANDARD: 1,
            VIP: 1.5,
            COUPLE: 2
        };

        // 🔹 1. Lấy showtime
        const showtime = await Showtime.findByPk(showtimeId);
        if (!showtime) throw new AppError(400, "Showtime không tồn tại");

        // 🔹 2. Lấy ghế
        const seats = await Seat.findAll({
            where: { id: seatIds, is_deleted: false }
        });

        if (seats.length !== seatIds.length) {
            throw new AppError(400, "Một số ghế không tồn tại");
        }

        // 🔹 3. Tính tiền vé theo loại ghế
        let ticket_total = 0;
        const ticketDetails = [];

        seats.forEach(seat => {
            const basePrice = showtime.base_price;
            const multiplier = SEAT_PRICE_MULTIPLIER[seat.type] || 1;
            const finalPrice = Math.round(basePrice * multiplier);

            ticket_total += finalPrice;

            ticketDetails.push({
                seat_id: seat.id,
                seat: `${seat.row_label}${seat.number}`,
                type: seat.type,
                base_price: basePrice,
                final_price: finalPrice
            });
        });

        // 🔹 4. Food
        let food_total = 0;
        const foodDetails = [];

        for (const item of foodItems) {
            const { foodId, quantity } = item;

            if (!foodId || !quantity || quantity <= 0) {
                throw new AppError(400, "Invalid food item");
            }

            const food = await Food.findOne({
                where: { id: foodId, is_deleted: false }
            });

            if (!food || !food.is_available) {
                throw new AppError(400, `Food ${foodId} not available`);
            }

            const total = food.price * quantity;
            food_total += total;

            foodDetails.push({
                id: food.id,
                name: food.name,
                price: food.price,
                quantity,
                total
            });
        }

        // 🔹 5. Voucher
        const amount = ticket_total + food_total;
        let discount = 0;
        let voucher = null;
        let voucherError = null;

        if (voucher_code) {
            try {
                voucher = await Voucher.findOne({
                    where: { code: voucher_code, is_deleted: false }
                });

                if (!voucher) throw new AppError(404, "Voucher not found");
                if (!voucher.is_active) throw new AppError(400, "Voucher is inactive");

                const now = new Date();
                if (now < new Date(voucher.start_date) || now > new Date(voucher.end_date)) {
                    throw new AppError(400, "Voucher expired");
                }

                if (voucher.usage_limit !== null) {
                    const usedCount = await UserVoucherUsage.count({
                        where: { voucher_id: voucher.id }
                    });
                    if (usedCount >= voucher.usage_limit) {
                        throw new AppError(400, "Voucher usage limit reached");
                    }
                }

                if (voucher.type === "PERCENT") {
                    discount = Math.round((voucher.value / 100) * amount);
                } else {
                    discount = Math.min(voucher.value, amount);
                }

            } catch (err) {
                voucherError = err.message;
                discount = 0;
                voucher = null;
            }
        }

        const total_amount = Math.max(amount - discount, 0);

        return res.status(200).json({
            success: !voucherError,
            message: voucherError || "Tính tổng tiền thành công",
            data: {
                ticket_total,
                ticket_details: ticketDetails,
                food_total,
                food_details: foodDetails,
                discount,
                voucher: voucher
                    ? { code: voucher.code, value: voucher.value, type: voucher.type }
                    : null,
                total_amount
            }
        });

    } catch (error) {
        next(error);
    }
};


const vnpayReturn = async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const { vnp_TxnRef, vnp_ResponseCode } = req.query;

        if (!vnp_TxnRef) {
            throw new AppError(400, "Missing transaction reference");
        }

        // 1. Tìm order
        const order = await Order.findOne({
            where: { id: vnp_TxnRef },
            include: [
                {
                    model: Ticket,
                    as: "tickets"
                },
                {
                    model: OrderFood,
                    as: "orderFoods"
                }
            ],
            transaction: t
        });

        if (!order) {
            throw new AppError(404, "Order not found");
        }

        if (order.status === 'SUCCESS') {
            throw new AppError(400, 'Order has already been paid successfully');
        }


        // PAYMENT SUCCESS
        if (vnp_ResponseCode === "00") {

            // 2. Update order
            order.status = "SUCCESS";
            order.payment_method = "VNPAY";
            order.payment_time = new Date();
            await order.save({ transaction: t });

            // 3. Update tickets -> CHECKED_IN
            for (const ticket of order.tickets) {
                ticket.ticket_status = "CHECKED_IN";
                await ticket.save({ transaction: t });

                // 4. Update ShowtimeSeat -> BOOKED
                await ShowtimeSeat.update(
                    { status: "BOOKED" },
                    {
                        where: {
                            showtime_id: ticket.showtime_id,
                            seat_id: ticket.seat_id
                        },
                        transaction: t
                    }
                );
            }

            // 5. Trừ kho food
            for (const item of order.orderFoods) {
                const food = await Food.findByPk(item.food_id, { transaction: t });

                if (!food) {
                    throw new AppError(404, `Food ${item.food_id} not found`);
                }

                if (food.stock < item.quantity) {
                    throw new AppError(400, `Food ${food.name} is out of stock`);
                }

                food.stock -= item.quantity;
                await food.save({ transaction: t });
            }

            await t.commit();

            return res.status(200).json({
                success: true,
                message: "Payment successful",
                data: {
                    order_id: order.id,
                    booking_code: order.booking_code,
                    status: order.status,
                    payment_time: order.payment_time
                }
            });

        }

        //  PAYMENT FAILED
        order.status = "FAILED";
        await order.save({ transaction: t });

        //  TRẢ GHẾ LẠI
        for (const ticket of order.tickets) {
            await ShowtimeSeat.update(
                { status: "AVAILABLE" },
                {
                    where: {
                        showtime_id: ticket.showtime_id,
                        seat_id: ticket.seat_id
                    },
                    transaction: t
                }
            );
        }

        await t.commit();

        return res.status(200).json({
            success: false,
            message: "Payment failed",
            data: {
                order_id: order.id,
                status: order.status,
                vnp_ResponseCode
            }
        });

    } catch (error) {
        await t.rollback();
        next(error);
    }
};




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
                    model: User,
                    as: 'user',
                    attributes: ['id','full_name','email','phone','image_url']
                },
                {
                    model: Ticket,
                    as: 'tickets',
                    attributes: ['id', 'qr_code', 'ticket_status'],
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
            const user = order.user;
            const movie = showtime?.movie;
            const room = showtime?.room;
            const cinema = room?.cinema;

            return {
                order_id: order.id,
                booking_code: order.booking_code,
                total_amount: order.total_amount,
                order_status: order.status,

                customer: {
                  id: user?.id,
                  name: user?.full_name,
                  email: user?.email,
                  phone: user?.phone,
                  avatar: user?.image_url
                },

                movie_name: movie?.title,
                genres: movie?.genres?.map(g => g.name),
                duration: movie?.duration,
                poster: movie?.poster_urls?.[0],
                showtime: showtime?.start_time,
                room: room?.name,
                cinema: cinema?.name,
                seats: tickets.map(t => `${t.seat?.row_label}${t.seat?.number}`),
                tickets: tickets.map(t => ({
                    code: t.qr_code,
                    status: t.ticket_status
                }))
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
                    attributes: ['id', 'qr_code', 'ticket_status'],
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
                tickets: tickets.map(t => ({
                    code: t.qr_code,
                    status: t.ticket_status
                }))

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
        const { id } = req.params;

        const order = await Order.findOne({
            where: {
                id,
                is_deleted: false
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id','full_name','email','phone','image_url']
                },
                {
                    model: Ticket,
                    as: 'tickets',
                    attributes: ['id', 'qr_code', 'price', 'ticket_status'],
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

        const user = order.user;

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

            customer: {
                id: user?.id,
                name: user?.full_name,
                email: user?.email,
                phone: user?.phone,
                avatar: user?.image_url
            },

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
            tickets: tickets.map(t => ({
                code: t.qr_code,
                status: t.ticket_status
            })),

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
            if (ticket.ticket_status === "PENDING") {
                ticket.ticket_status = "CHECKED_IN";
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


const getSystemCheckinHistory = async (req, res, next) => {
    try {
        let { pageNo = 1, pageSize = 10, ticket_status } = req.query;

        pageNo = parseInt(pageNo);
        pageSize = parseInt(pageSize);
        const offset = (pageNo - 1) * pageSize;

        // Điều kiện filter
        const ticketWhere = {};
        if (ticket_status) ticketWhere.ticket_status = ticket_status;

        const { count, rows } = await Order.findAndCountAll({
            where: { is_deleted: false },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id','full_name','email','phone','image_url']
                },
                {
                    model: Ticket,
                    as: 'tickets',
                    where: ticketWhere,
                    required: false,
                    attributes: ['qr_code', 'ticket_status'],
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

            const user = order.user;

            const showtime = firstTicket?.showtime;
            const movie = showtime?.movie;
            const room = showtime?.room;
            const cinema = room?.cinema;

            return {
                order_id: order.id,
                booking_code: order.booking_code,
                
                customer: {
                  id: user?.id,
                  name: user?.full_name,
                  email: user?.email,
                  phone: user?.phone,
                  avatar: user?.image_url
                },

                movie_name: movie?.title,
                genres: movie?.genres?.map(g => g.name),
                duration: movie?.duration,
                poster: movie?.poster_urls?.[0],
                showtime: showtime?.start_time,
                room: room?.name,
                cinema: cinema?.name,
                tickets: tickets.map(t => ({
                    qr_code: t.qr_code,
                    seat: t.seat ? `${t.seat.row_label}${t.seat.number}` : null,
                    ticket_status: t.ticket_status
                }))
            };
        });

        return res.status(200).json({
            success: true,
            message: "Get system check-in history successfully",
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


module.exports = {
    getAllOrders,
    getMyBookingHistory,
    getOrderDetailById,
    checkInAllTickets,
    getSystemCheckinHistory
    ,checkoutOrder
    ,createOrder,
    vnpayReturn
}