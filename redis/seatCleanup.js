const cron = require('node-cron');
const { Op, Sequelize } = require('sequelize'); // ❗ NHỚ IMPORT Sequelize
const ShowtimeSeat = require('../models/ShowtimeSeat');

const startSeatCleanupJob = (io) => {
    cron.schedule('* * * * *', async () => {
        try {
            // Sử dụng CURRENT_TIMESTAMP của Database để so sánh
            const stuckSeats = await ShowtimeSeat.findAll({
                where: {
                    status: 'HOLDING',
                    hold_expired_at: { 
                        [Op.lt]: Sequelize.literal('CURRENT_TIMESTAMP') 
                    }
                },
                raw: true
            });

            if (stuckSeats.length === 0) return;

            const stuckSeatIds = stuckSeats.map(s => s.id);

            // Update về AVAILABLE
            await ShowtimeSeat.update(
                { status: 'AVAILABLE', hold_expired_at: null },
                { where: { id: { [Op.in]: stuckSeatIds } } }
            );

            // Bắn socket đơn lẻ để giữ nguyên logic Frontend
            stuckSeats.forEach(seat => {
                io.to(`showtime_${seat.showtime_id}`).emit('seatReleased', { seatId: seat.seat_id });
                console.log(`🧹 Đã giải phóng cưỡng bức ghế ${seat.seat_id} suất ${seat.showtime_id}`);
            });

        } catch (error) {
            console.error("❌ Lỗi dọn dẹp:", error);
        }
    });
};

module.exports = { startSeatCleanupJob };