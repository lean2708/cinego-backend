const AppError = require("./appError");
const jwt = require('jsonwebtoken');
require('dotenv').config();



const generateToken = (user, secret, expiresIn) => {
    const payload = {
        id: user.id,
        email: user.email,
    };

    return jwt.sign(payload, secret, {
    expiresIn: expiresIn,
  });
}


const generateAccessToken = (user) => {
    const secret = process.env.JWT_ACCESS_KEY;
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN;

    return generateToken(user, secret, expiresIn);
}


const verifyToken = (token, secret) => {
    try {
       return jwt.verify(token, secret);
    } catch (error) {
      throw new AppError(401, "Token is invalid or expired.");
    }
}


module.exports = {
    generateAccessToken, 
    verifyToken
}