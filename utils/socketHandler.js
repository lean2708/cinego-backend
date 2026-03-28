const redisClient = require('../config/redis');
const ShowtimeSeat = require('../models/ShowtimeSeat');
const Ticket = require('../models/Ticket');

/**
 * Initialize socket.io event handlers
 * @param {Server} io - Socket.io server instance
 */
const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        socket.on('joinShowtime', (showtimeId) => {
            socket.join(`showtime_${showtimeId}`);
        });
        socket.on('lockSeat', async ({ showtimeId, seatId, userId }) => {
            const lockKey = `lock:showtime:${showtimeId}:seat:${seatId}`;
            const holdTime = 300; // 5 minutes hold time
            try {
                const isLocked = await redisClient.set(lockKey, userId, 'EX', holdTime, 'NX');
                if (isLocked) {
                    await ShowtimeSeat.upsert({
                        showtime_id: showtimeId,
                        seat_id: seatId,
                        status: 'HOLDING',
                        hold_expired_at: new Date(Date.now() + holdTime * 1000)
                    });
                    socket.to(`showtime_${showtimeId}`).emit('seatLocked', { seatId, userId });
                } else {
                    socket.emit('error', 'Ghế đã có người giữ, vui lòng chọn ghế khác');
                }
            } catch (error) {
                console.error("Lock seat error:", error);
                socket.emit('error', 'Lỗi hệ thống khi khóa ghế');
            }
        });

        // Release seat
        socket.on('releaseSeat', async ({ showtimeId, seatId }) => {
            const lockKey = `lock:showtime:${showtimeId}:seat:${seatId}`;
            try {
                await redisClient.del(lockKey);
                await ShowtimeSeat.update(
                    { status: 'AVAILABLE', hold_expired_at: null },
                    { where: { showtime_id: showtimeId, seat_id: seatId } }
                );
                io.to(`showtime_${showtimeId}`).emit('seatReleased', { seatId });
            } catch (error) {
                console.error("Release seat error:", error);
            }
        });
        socket.on('verifyTicket', async ({ ticketId, showId }) => {
            try {
                const ticket = await Ticket.findByPk(ticketId);
                if (!ticket) {
                    socket.emit('error', 'Vé không tồn tại');
                    return;
                }
                if (ticket.ticket_status === 'CHECKED_IN') {
                    socket.emit('ticketVerified', { 
                        valid: false, 
                        message: 'Vé đã được sử dụng',
                        ticketId 
                    });
                    return;
                }
                if (ticket.ticket_status === 'EXPIRED') {
                    socket.emit('ticketVerified', { 
                        valid: false, 
                        message: 'Vé đã hết hạn',
                        ticketId 
                    });
                    return;
                }
                if (ticket.ticket_status !== 'PENDING') {
                    socket.emit('ticketVerified', { 
                        valid: false, 
                        message: 'Vé không hợp lệ',
                        ticketId 
                    });
                    return;
                }
                socket.emit('ticketVerified', { 
                    valid: true, 
                    message: 'Vé hợp lệ',
                    ticketId,
                    showId,
                    bookingId: ticket.booking_id
                });
            } catch (error) {
                console.error("Verify ticket error:", error);
                socket.emit('error', 'Lỗi hệ thống khi xác thực vé');
            }
        });

        // Check-in ticket
        socket.on('checkInTicket', async ({ ticketId, showId, staffId }) => {
            try {
                const ticket = await Ticket.findByPk(ticketId);
                if (!ticket) {
                    socket.emit('error', 'Vé không tồn tại');
                    return;
                }
                if (ticket.ticket_status === 'CHECKED_IN') {
                    socket.emit('error', 'Vé đã được checkin rồi');
                    return;
                }
                if (ticket.ticket_status === 'EXPIRED') {
                    socket.emit('error', 'Vé đã hết hạn, không thể checkin');
                    return;
                }
                if (ticket.ticket_status !== 'PENDING') {
                    socket.emit('error', 'Vé không hợp lệ để checkin');
                    return;
                }
                const checkInKey = `checkin:ticket:${ticketId}`;
                const checkInRecord = {
                    ticketId,
                    showId,
                    staffId,
                    checkedInAt: new Date().toISOString()
                };
                await redisClient.set(checkInKey, JSON.stringify(checkInRecord), 'EX', 86400);
                await ticket.update({ 
                    ticket_status: 'CHECKED_IN'
                });
                io.to(`showtime_${showId}`).emit('ticketCheckedIn', {
                    ticketId,
                    showId,
                    seatNumber: ticket.seat_number,
                    bookingCode: ticket.booking?.booking_code || 'N/A',
                    checkedInAt: new Date().toISOString(),
                    message: 'Checkin vé thành công'
                });
                socket.emit('checkInSuccess', {
                    ticketId,
                    message: 'Checkin vé thành công',
                    checkedInAt: new Date().toISOString()
                });
            } catch (error) {
                console.error("Check-in ticket error:", error);
                socket.emit('error', 'Lỗi hệ thống khi checkin vé');
            }
        });

        // Get check-in status
        socket.on('getCheckInStatus', async ({ ticketId }) => {
            try {
                const ticket = await Ticket.findByPk(ticketId);
                if (!ticket) {
                    socket.emit('error', 'Vé không tồn tại');
                    return;
                }
                const checkInKey = `checkin:ticket:${ticketId}`;
                const checkInRecord = await redisClient.get(checkInKey);

                socket.emit('checkInStatus', {
                    ticketId,
                    status: ticket.ticket_status,
                    checkInDetails: checkInRecord ? JSON.parse(checkInRecord) : null
                });
            } catch (error) {
                console.error("Get check-in status error:", error);
                socket.emit('error', 'Lỗi hệ thống khi lấy trạng thái checkin');
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = initializeSocket;
