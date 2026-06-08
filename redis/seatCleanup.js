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
                },
                raw: true // Lấy dữ liệu thuần giúp tăng tốc xử lý truy vấn
            });

            if (stuckSeats.length === 0) return; // Không có ghế kẹt thì dừng lại luôn

            // 2. Gom danh sách ID của các bản ghi cần update
            const stuckSeatIds = stuckSeats.map(seat => seat.id);

            // 3. Update hàng loạt trạng thái ghế kẹt về AVAILABLE trong 1 câu lệnh duy nhất (Tối ưu DB)
            await ShowtimeSeat.update(
                { 
                    status: 'AVAILABLE', 
                    hold_expired_at: null 
                },
                { 
                    where: {
                        id: { [Op.in]: stuckSeatIds }
                    }
                }
            );

            // 4. DUYỆT MẢNG VÀ PHÁT SỰ KIỆN ĐƠN (Giữ nguyên cấu trúc `seatReleased`)
            stuckSeats.forEach(seat => {
                // Ép kiểu ID sang số an toàn phòng hờ lỗi String/Number
                const showtimeId = Number(seat.showtime_id);
                const seatId = Number(seat.seat_id);

                // Bắn socket đơn lẻ về cho phòng cụ thể như cũ
                io.to(`showtime_${showtimeId}`).emit('seatReleased', { seatId });
                
                console.log(`🧹 [CRON VÉT ĐÁY]: Đã giải phóng ghế đơn lẻ ${seatId} thuộc suất chiếu ${showtimeId}`);
            });

        } catch (error) {
            console.error("❌ [CRON JOB ERROR]: Thất bại khi dọn dẹp dữ liệu ghế kẹt:", error);
        }
    });

    console.log("⏳ Cronjob: Seat Cleanup (Giữ nguyên sự kiện đơn lẻ) đã khởi động!");
};

module.exports = { startSeatCleanupJob };