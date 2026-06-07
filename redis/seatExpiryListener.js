const ShowtimeSeat = require("../models/ShowtimeSeat");

const initSeatExpiryListener = (io, redisClient) => {

    const subscriber = redisClient.duplicate(); // ❗ KHÔNG connect()

    console.log("🔥 Redis Seat Expiry Listener STARTED");

    subscriber.subscribe("__keyevent@0__:expired", async (key) => {
        try {
            const keyStr = String(key);

            if (!keyStr.startsWith("lock:showtime:")) return;

            const parts = keyStr.split(":");
            const showtimeId = parts[2];
            const seatId = parts[4];

            const seat = await ShowtimeSeat.findOne({
                where: { showtime_id: showtimeId, seat_id: seatId }
            });

            if (!seat || seat.status === "BOOKED") return;
            if (!seat || seat.status === "AVAILABLE") return;

            await ShowtimeSeat.update(
                {
                    status: "AVAILABLE",
                    hold_expired_at: null
                },
                {
                    where: { showtime_id: showtimeId, seat_id: seatId }
                }
            );

            io.to(`showtime_${showtimeId}`).emit("seatReleased", { seatId });

            console.log("⏰ AUTO RELEASE:", seatId);

        } catch (err) {
            console.error("❌ Redis expiry error:", err);
        }
    });
};

module.exports = initSeatExpiryListener;