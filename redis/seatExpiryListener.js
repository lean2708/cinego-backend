const Redis = require("ioredis"); // ❗ Đảm bảo import thư viện Redis để tạo client mới
const ShowtimeSeat = require("../models/ShowtimeSeat");

const initSeatExpiryListener = async (io, redisClient) => {
    // 1. TỰ ĐỘNG CẤU HÌNH KÍCH HOẠT EVENT TRÊN REDIS (Dành cho client chính)
    try {
        await redisClient.config("SET", "notify-keyspace-events", "Ex");
        console.log("🟢 [REDIS CONFIG]: Đã tự động kích hoạt cấu hình 'Ex' thành công.");
    } catch (err) {
        console.warn("⚠️ [REDIS CONFIG WARNING]: Không thể chạy CONFIG SET tự động (Có thể do Cloud chặn). Hãy chắc chắn tham số 'notify-keyspace-events' là 'Ex' trên Cloud Dashboard.");
    }

    // 2. KHỞI TẠO CLIENT LIÊN KẾT RIÊNG CHO PUB/SUB (Tránh dùng duplicate lỗi kết nối ngầm)
    // Cách này nhân bản cấu hình chuẩn xác dựa trên URL hoặc Host/Port hiện tại của dự án
    const subscriber = new Redis(redisClient.options); 

    // 3. ĐỢI CLIENT PUB/SUB KẾT NỐI SẴN SÀNG RỒI MỚI ĐĂNG KÝ NGHE kEY
    subscriber.on("ready", () => {
        console.log("🔥 [REDIS SUBSCRIBER]: Kết nối thành công! Đang tiến hành đăng ký psubscribe...");
        
        subscriber.psubscribe("__keyevent@*__:expired", (err, count) => {
            if (err) {
                console.error("❌ [REDIS ERROR]: Lỗi khi psubscribe keyspace events:", err);
            } else {
                console.log(`✅ [REDIS SUCCESS]: Hệ thống nghe Key hết hạn đã SẴN SÀNG trên toàn bộ DB Index.`);
            }
        });
    });

    // Lắng nghe lỗi kết nối riêng của kênh subscriber nếu có
    subscriber.on("error", (err) => {
        console.error("❌ [REDIS SUBSCRIBER ERROR]: Lỗi kết nối Pub/Sub:", err);
    });

    // 4. HỨNG SỰ KIỆN QUA 'pmessage'
    subscriber.on("pmessage", async (pattern, channel, message) => {
        try {
            const keyStr = String(message); // Ví dụ: lock:showtime:12:seat:34

            if (!keyStr.startsWith("lock:showtime:")) return;

            console.log(`⏰ [REDIS EVENT]: Phát hiện Key hết hạn -> ${keyStr}`);

            const parts = keyStr.split(":");
            const showtimeIdStr = parts[2];
            const seatIdStr = parts[4];

            // Đặt tên biến rõ ràng tránh nhầm lẫn kiểu dữ liệu
            const finalShowtimeId = Number(showtimeIdStr);
            const finalSeatId = Number(seatIdStr);

            // Tìm thông tin trạng thái ghế hiện tại
            const seat = await ShowtimeSeat.findOne({
                where: { showtime_id: finalShowtimeId, seat_id: finalSeatId }
            });

            if (!seat) {
                console.log(`⚠️ [DB WARNING]: Ghế không tồn tại: Showtime ${finalShowtimeId} - Seat ${finalSeatId}`);
                return;
            }

            // Nếu ghế đã BOOKED hoặc đã AVAILABLE rồi thì hủy dọn dẹp
            if (seat.status === "BOOKED" || seat.status === "AVAILABLE") {
                console.log(`⚠️ [DB SKIP]: Ghế đang ở trạng thái [${seat.status}], không xử lý.`);
                return;
            }

            // Thực hiện giải phóng ghế dưới DB Production
            const [updatedRows] = await ShowtimeSeat.update(
                {
                    status: "AVAILABLE",
                    hold_expired_at: null
                },
                {
                    where: { showtime_id: finalShowtimeId, seat_id: finalSeatId }
                }
            );

            if (updatedRows > 0) {
                // Bắn Socket realtime về Room cụ thể của lịch chiếu đó
                io.to(`showtime_${finalShowtimeId}`).emit("seatReleased", { seatId: finalSeatId });
                console.log(`✅ [AUTO RELEASE SUCCESS]: Đã giải phóng ghế ${finalSeatId} của lịch chiếu ${finalShowtimeId}`);
            } else {
                console.log(`❌ [DB UPDATE FAILED]: Khớp điều kiện nhưng không thể update dữ liệu.`);
            }

        } catch (err) {
            console.error("❌ [SYSTEM ERROR]: Thất bại khi xử lý dọn dẹp ghế:", err);
        }
    });
};

module.exports = initSeatExpiryListener;