const authRouter = require("./authRoute");
const provinceRouter = require("./provinceRoute");
const cinemaRouter = require("./cinemaRoute");
const seatRouter = require("./seatRoute");
const userRouter = require("./userRoute");
const foodRouter = require("./foodRoute");
const voucherRouter = require("./voucherRoute");
const contactRouter = require("./contactRoute");
const movieRouter = require("./movieRoute");
const genreRouter = require("./genreRoute");
const fileRouter = require("./fileRoute");
const showtimeRouter = require("./showtimeRoute");
const express = require("express");



const router = express.Router();




router.use("/auth", authRouter);
router.use("/provinces", provinceRouter);
router.use("/cinemas", cinemaRouter);
router.use("/movies", movieRouter);
router.use("/genres", genreRouter);
router.use("/seats", seatRouter);

router.use("/users", userRouter);

router.use("/foods", foodRouter);
router.use("/vouchers", voucherRouter);


router.use("/contacts", contactRouter);

router.use("/files", fileRouter);


router.use("/showtimes", showtimeRouter);



module.exports = router;