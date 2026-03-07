const authRouter = require("./authRoute");
const provinceRouter = require("./provinceRoute");
const cinemaRouter = require("./cinemaRoute");
const seatRouter = require("./seatRoute");
const userRouter = require("./userRoute");
const foodRouter = require("./foodRoute");
const express = require("express");



const router = express.Router();




router.use("/auth", authRouter);
router.use("/provinces", provinceRouter);
router.use("/cinemas", cinemaRouter);
router.use("/seats", seatRouter);

router.use("/users", userRouter);

router.use("/foods", foodRouter);

module.exports = router;