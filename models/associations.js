const User = require('./User');
const Movie = require('./Movie');
const Genre = require('./Genre');
const MovieGenre = require('./MovieGenre');
const Province = require('./Province');
const Cinema = require('./Cinema');
const CinemaRoom = require('./CinemaRoom');
const Seat = require('./Seat');
const Showtime = require('./Showtime');
const ShowtimeSeat = require('./ShowtimeSeat');
const Order = require('./Order');
const Ticket = require('./Ticket');
const Food = require('./Food');
const OrderFood = require('./OrderFood');
const Voucher = require('./Voucher');
const UserVoucherUsage = require('./UserVoucherUsage');

function initializeAssociations() {
    // ==================== Province - Cinema ====================
    // Một tỉnh/thành phố có nhiều rạp chiếu
    Province.hasMany(Cinema, { foreignKey: 'province_id', as: 'cinemas' });
    Cinema.belongsTo(Province, { foreignKey: 'province_id', as: 'province' });

    // ==================== Cinema - CinemaRoom ====================
    // Một rạp chiếu có nhiều phòng chiếu
    Cinema.hasMany(CinemaRoom, { foreignKey: 'cinema_id', as: 'rooms' });
    CinemaRoom.belongsTo(Cinema, { foreignKey: 'cinema_id', as: 'cinema' });

    // ==================== CinemaRoom - Seat ====================
    // Một phòng chiếu có nhiều ghế
    CinemaRoom.hasMany(Seat, { foreignKey: 'room_id', as: 'seats' });
    Seat.belongsTo(CinemaRoom, { foreignKey: 'room_id', as: 'room' });

    // ==================== Movie - Showtime ====================
    // Một phim có nhiều suất chiếu
    Movie.hasMany(Showtime, { foreignKey: 'movie_id', as: 'showtimes' });
    Showtime.belongsTo(Movie, { foreignKey: 'movie_id', as: 'movie' });

    // ==================== CinemaRoom - Showtime ====================
    // Một phòng chiếu có nhiều suất chiếu
    CinemaRoom.hasMany(Showtime, { foreignKey: 'room_id', as: 'showtimes' });
    Showtime.belongsTo(CinemaRoom, { foreignKey: 'room_id', as: 'room' });

    // ==================== Showtime - ShowtimeSeat ====================
    // Một suất chiếu có nhiều ghế
    Showtime.hasMany(ShowtimeSeat, { foreignKey: 'showtime_id', as: 'showtimeSeats' });
    ShowtimeSeat.belongsTo(Showtime, { foreignKey: 'showtime_id', as: 'showtime' });

    // ==================== Seat - ShowtimeSeat ====================
    // Một ghế có thể xuất hiện ở nhiều suất chiếu (qua ShowtimeSeat)
    Seat.hasMany(ShowtimeSeat, { foreignKey: 'seat_id', as: 'showtimeSeats' });
    ShowtimeSeat.belongsTo(Seat, { foreignKey: 'seat_id', as: 'seat' });

    // ==================== User - Order ====================
    // Một người dùng có nhiều đơn hàng
    User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
    Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    // ==================== Order - Ticket ====================
    // Một đơn hàng có nhiều vé
    Order.hasMany(Ticket, { foreignKey: 'order_id', as: 'tickets' });
    Ticket.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

    // ==================== Showtime - Ticket ====================
    // Một suất chiếu có nhiều vé
    Showtime.hasMany(Ticket, { foreignKey: 'showtime_id', as: 'tickets' });
    Ticket.belongsTo(Showtime, { foreignKey: 'showtime_id', as: 'showtime' });

    // ==================== Seat - Ticket ====================
    // Một ghế có thể có nhiều vé (ở các suất chiếu khác nhau)
    Seat.hasMany(Ticket, { foreignKey: 'seat_id', as: 'tickets' });
    Ticket.belongsTo(Seat, { foreignKey: 'seat_id', as: 'seat' });

    // ==================== Order - OrderFood ====================
    // Một đơn hàng có nhiều đồ ăn
    Order.hasMany(OrderFood, { foreignKey: 'order_id', as: 'orderFoods' });
    OrderFood.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

    // ==================== Food - OrderFood ====================
    // Một món ăn có thể xuất hiện trong nhiều đơn hàng
    Food.hasMany(OrderFood, { foreignKey: 'food_id', as: 'orderFoods' });
    OrderFood.belongsTo(Food, { foreignKey: 'food_id', as: 'food' });

    // ==================== User - UserVoucherUsage ====================
    // Một người dùng có thể sử dụng nhiều voucher
    User.hasMany(UserVoucherUsage, { foreignKey: 'user_id', as: 'voucherUsages' });
    UserVoucherUsage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

    // ==================== Voucher - UserVoucherUsage ====================
    // Một voucher có thể được sử dụng bởi nhiều người dùng
    Voucher.hasMany(UserVoucherUsage, { foreignKey: 'voucher_id', as: 'usages' });
    UserVoucherUsage.belongsTo(Voucher, { foreignKey: 'voucher_id', as: 'voucher' });

    // ==================== Order - UserVoucherUsage ====================
    // Một đơn hàng có thể gắn với một lần dùng voucher
    Order.hasMany(UserVoucherUsage, { foreignKey: 'order_id', as: 'voucherUsages' });
    UserVoucherUsage.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

    // ==================== Movie - Genre (Many-to-Many qua MovieGenre) ====================
    Movie.belongsToMany(Genre, {
        through: MovieGenre,
        foreignKey: 'movie_id',
        otherKey: 'genre_id',
        as: 'genres',
    });
    Genre.belongsToMany(Movie, {
        through: MovieGenre,
        foreignKey: 'genre_id',
        otherKey: 'movie_id',
        as: 'movies',
    });
}

module.exports = initializeAssociations;
