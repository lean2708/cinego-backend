const cron = require('node-cron');
const { Op } = require('sequelize');
const ShowtimeSeat = require('../models/ShowtimeSeat');

const startSeatCleanupJob = (io) => {
    // Chạy ngầm mỗi 1 phút
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            
            // 1. Tìm tất cả các ghế đang bị kẹt (HOLDING nhưng đã quá hạn)
            const stuckSeats = await ShowtimeSeat.findAll({
                where: {
                    status: 'HOLDING',
                    hold_expired_at: {
                        [Op.lt]: now // Thời gian hết hạn < Thời gian hiện tại
                    }
                }
            });

            if (stuckSeats.length === 0) return; // Không có ghế kẹt thì thôi

            // 2. Gom nhóm ghế theo suất chiếu để dễ bắn socket
            const showtimeMap = {};
            const stuckSeatIds = [];

            stuckSeats.forEach(seat => {
                stuckSeatIds.push(seat.id); // Lưu ID để update DB
                if (!showtimeMap[seat.showtime_id]) {
                    showtimeMap[seat.showtime_id] = [];
                }
                showtimeMap[seat.showtime_id].push(seat.seat_id);
            });

            // 3. Update toàn bộ ghế kẹt về AVAILABLE trong 1 câu query duy nhất
            await ShowtimeSeat.update(
                { status: 'AVAILABLE', hold_expired_at: null },
                { 
                    where: {
                        status: 'HOLDING',
                        hold_expired_at: { [Op.lt]: now }
                    }
                }
            );

            // 4. Bắn Socket cho các phòng (room) có ghế vừa được dọn
            for (const [showtimeId, seats] of Object.entries(showtimeMap)) {
                seats.forEach(seatId => {
                    io.to(`showtime_${showtimeId}`).emit('seatReleased', { seatId });
                    console.log(`🧹 CRON VÉT ĐÁY: Đã dọn ghế kẹt ${seatId} của suất chiếu ${showtimeId}`);
                });
            }

        } catch (error) {
            console.error("❌ Lỗi khi chạy Cron dọn ghế kẹt:", error);
        }
    });

    console.log("⏳ Cronjob: Seat Cleanup (Vét đáy ghế kẹt) đã khởi động!");
};

module.exports = { startSeatCleanupJob };