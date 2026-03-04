const authRouter = require("./authRoute");
const provinceRouter = require("./provinceRoute");
const express = require("express");



const router = express.Router();




router.use("/auth", authRouter);
router.use("/provinces", provinceRouter);





module.exports = router;