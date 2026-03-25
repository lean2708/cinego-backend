
const { Op,fn, col, literal } = require("sequelize");
const Ticket = require("../models/Ticket");
const Order = require("../models/Order");


const getTicketDashboardToday = async (req, res, next) => {
    try {
        //  thời gian hôm nay
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Vé bán trong ngày
        const totalTicketsSoldToday = await Ticket.count({
            include: [
                {
                    model: Order,
                    as: "order",
                    required: true,
                    where: {
                        status: "SUCCESS",
                        created_at: {
                            [Op.between]: [startOfDay, endOfDay]
                        }
                    }
                }
            ]
        });

        // Vé đã check-in trong ngày
        const totalTicketsCheckedInToday = await Ticket.count({
            where: {
                ticket_status: "CHECKED_IN",
                updated_at: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "Get ticket dashboard today successfully",
            data: {
                date: startOfDay.toISOString().split("T")[0],
                total_tickets_sold: totalTicketsSoldToday,
                total_tickets_checked_in: totalTicketsCheckedInToday
            }
        });

    } catch (error) {
        next(error);
    }
};


const getTicketDashboardOverall = async (req, res, next) => {
    try {
        let { type = "MONTH" } = req.query;
        type = type.toUpperCase();

        const now = new Date();
        let groupFormat;
        let whereCondition = {};

        if (type === "WEEK") {
            //trong tháng hiện tại
            const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);

            whereCondition.created_at = {
                [Op.between]: [startDate, endDate]
            };

            groupFormat = fn("DATE_TRUNC", "week", col("order.created_at"));

        } else if (type === "MONTH") {
            // trong năm hiện tại
            const startDate = new Date(now.getFullYear(), 0, 1);
            const endDate = new Date(now.getFullYear(), 11, 31);
            endDate.setHours(23, 59, 59, 999);

            whereCondition.created_at = {
                [Op.between]: [startDate, endDate]
            };

            groupFormat = fn("DATE_TRUNC", "month", col("order.created_at"));

        } else if (type === "YEAR") {
            // group theo năm
            groupFormat = fn("DATE_TRUNC", "year", col("order.created_at"));

        } else {
            return res.status(400).json({
                success: false,
                message: "type must be WEEK | MONTH | YEAR"
            });
        }

        const results = await Ticket.findAll({
            attributes: [
                [groupFormat, "label"],
                [fn("COUNT", col("Ticket.id")), "total_tickets"]
            ],
            include: [
                {
                    model: Order,
                    as: "order",
                    required: true,
                    where: {
                        status: "SUCCESS",
                        ...whereCondition
                    },
                    attributes: []
                }
            ],
            group: [literal("label")],
            order: [[literal("label"), "ASC"]],
            raw: true
        });

        // FORMAT DATA
        const formatted = results.map(item => {
            const date = new Date(item.label);
            let label;

            if (type === "YEAR") {
                label = date.getFullYear(); // 2026
            } 
            else if (type === "MONTH") {
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const year = date.getFullYear();
                label = `${month}/${year}`; // 03/2026
            } 
            else if (type === "WEEK") {
                // tuần bắt đầu từ ngày này
                const start = new Date(date);
                const end = new Date(date);
                end.setDate(start.getDate() + 6);

                const format = (d) => {
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    return `${day}/${month}`;
                };

                label = `${format(start)} - ${format(end)}`; 
                // ví dụ: 04/03 - 10/03
            }

            return {
                label,
                total_tickets: Number(item.total_tickets)
            };
        });

        return res.status(200).json({
            success: true,
            message: "Get ticket dashboard overall successfully",
            data: {
                type,
                items: formatted
            }
        });

    } catch (error) {
        next(error);
    }
};




module.exports = {
    getTicketDashboardToday,
    getTicketDashboardOverall
};