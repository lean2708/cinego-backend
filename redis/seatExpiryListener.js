const ShowtimeSeat = require("../models/ShowtimeSeat");

const initSeatExpiryListener = (io, redisClient) => {
    // Nhân bản client để làm nhiệm vụ Pub/Sub riêng biệt
    const subscriber = redisClient.duplicate(); 

    console.log("🔥 Redis Seat Expiry Listener STARTED");

    // 1. Dùng psubscribe với ký tự đại diện (*) để nghe TẤT CẢ các Database tránh lệch DB Index
    subscriber.psubscribe("__keyevent@*__:expired", (err, count) => {
        if (err) {
            console.error("❌ Lỗi khi psubscribe Redis keyspace events:", err);
        } else {
            console.log(`✅ Đã đăng ký thành công hệ thống lắng nghe Keyspace Events.`);
        }
    });

    // 2. Đối với psubscribe, ta phải hứng sự kiện bằng .on("pmessage")
    subscriber.on("pmessage", async (pattern, channel, message) => {
        try {
            const keyStr = String(message); // Tên key vừa hết hạn
            
            // Lọc đúng key giữ ghế của hệ thống
            if (!keyStr.startsWith("lock:showtime:")) return;

            console.log(`⏰ [REDIS EVENT] Phát hiện Key hết hạn: ${keyStr}`);

            const parts = keyStr.split(":");
            const showtimeId = parts[2];
            const seatId = parts[4];

            // Ép kiểu an toàn sang Số (Number) phục vụ cho DB Production chặt chẽ
            const sId = Number(showtimeId);
            const stId = Number(seatId);

            // Tìm xem ghế có thực sự đang bị khóa không
            const seat = await ShowtimeSeat.findOne({
                where: { showtime_id: sId, seat_id: stId }
            });

            if (!seat) {
                console.log(`⚠️ Ghế không tồn tại trong DB: Showtime ${sId} - Seat ${stId}`);
                return;
            }

            // Nếu ghế đã được đặt thành công (BOOKED) hoặc đã mở khóa rồi thì bỏ qua
            if (seat.status === "BOOKED" || seat.status === "AVAILABLE") {
                console.log(`⚠️ Ghế ${stId} đang ở trạng thái [${seat.status}], không cần dọn dẹp.`);
                return;
            }

            // Tiến hành giải phóng ghế dưới DB
            const [updatedRows] = await ShowtimeSeat.update(
                {
                    status: "AVAILABLE",
                    hold_expired_at: null
                },
                {
                    where: { showtime_id: sId, seat_id: stId }
                }
            );

            if (updatedRows > 0) {
                // Phát Socket realtime về cho các Client đang xem lịch chiếu đó qua room
                io.to(`showtime_${showtimeId}`).emit("seatReleased", { seatId: stId });
                console.log(`✅ [AUTO RELEASE SUCCESS]: Giải phóng thành công ghế ${stId} của Showtime ${sId}`);
            } else {
                console.log(`❌ [DB UPDATE FAILED]: Khớp điều kiện nhưng không có dòng nào được cập nhật.`);
            }

        } catch (err) {
            console.error("❌ Hệ thống xử lý lỗi hết hạn Redis thất bại:", err);
        }
    });
};

module.exports = initSeatExpiryListener;