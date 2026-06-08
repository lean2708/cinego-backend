const ShowtimeSeat = require("../models/ShowtimeSeat");

const initSeatExpiryListener = (io, redisClient) => {
    const subscriber = redisClient.duplicate();

    console.log("🔥 Redis Seat Expiry Listener STARTED");

    // 1. Chỉ dùng subscribe để đăng ký channel
    subscriber.subscribe("__keyevent@0__:expired", (err, count) => {
        if (err) {
            console.error("❌ Lỗi khi subscribe Redis keyspace events:", err);
        } else {
            console.log(`✅ Đã subscribe thành công vào ${count} channel(s).`);
        }
    });

    // 2. Dùng sự kiện 'message' để nhận tên key bị hết hạn
    subscriber.on("message", async (channel, message) => {
        try {
            const keyStr = String(message);
            
            if (!keyStr.startsWith("lock:showtime:")) return;

            const parts = keyStr.split(":");
            const showtimeId = parts[2];
            const seatId = parts[4];

            const seat = await ShowtimeSeat.findOne({
                where: { showtime_id: showtimeId, seat_id: seatId }
            });

            if (!seat || seat.status === "BOOKED" || seat.status === "AVAILABLE") return;

            // Mở khóa ghế
            await ShowtimeSeat.update(
                {
                    status: "AVAILABLE",
                    hold_expired_at: null
                },
                {
                    where: { showtime_id: showtimeId, seat_id: seatId }
                }
            );

            // Báo cho các client khác
            io.to(`showtime_${showtimeId}`).emit("seatReleased", { seatId });
            console.log("⏰ AUTO RELEASE SEAT:", seatId);

        } catch (err) {
            console.error("❌ Redis expiry xử lý lỗi:", err);
        }
    });
};

module.exports = initSeatExpiryListener;