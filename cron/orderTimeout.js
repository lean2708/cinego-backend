const cron = require("node-cron");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

const Order = require("../models/Order");
const Ticket = require("../models/Ticket");
const ShowtimeSeat = require("../models/ShowtimeSeat");

const TIMEOUT_MINUTES = 20;


const startOrderTimeoutJob = () => {
    cron.schedule("* * * * *", async () => {
        const t = await sequelize.transaction();

        try {
            console.log("Checking timeout orders...");

            const expiredTime = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000);

            // 1. tìm order quá hạn
            const orders = await Order.findAll({
                where: {
                    status: "PENDING",
                    created_at: {
                        [Op.lte]: expiredTime
                    }
                },
                include: [
                    {
                        model: Ticket,
                        as: "tickets"
                    }
                ],
                transaction: t
            });

            if (orders.length === 0) {
                await t.commit();
                return;
            }

            console.log(`Found ${orders.length} expired orders`);

            for (const order of orders) {
                 console.log(`Order timeout -> ID: ${order.id}, Booking: ${order.booking_code}`);

                // 2. update order
                order.status = "FAILED";
                await order.save({ transaction: t });

                // 3. trả ghế
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

                    // (optional) update ticket
                    ticket.ticket_status = "EXPIRED";
                    await ticket.save({ transaction: t });
                }
            }

            await t.commit();

            console.log("Timeout job done");

        } catch (error) {
            await t.rollback();
            console.error("Cron job error:", error);
        }
    });
};

module.exports = { startOrderTimeoutJob };