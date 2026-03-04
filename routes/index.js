const authRouter = require("./authRoute");
const userRouter = require("./userRoute");
const express = require("express");



const router = express.Router();




router.use("/auth", authRouter);

router.use("/users", userRouter);



module.exports = router;