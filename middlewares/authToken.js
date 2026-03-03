
const AppError = require("../utils/appError");
const jwt = require('jsonwebtoken');
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");



const authToken = async (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            throw new AppError(401, "Access denied. Token not found.");
        }

        const token = authHeader.split(' ')[1];

        const decoded = verifyToken(token, process.env.JWT_ACCESS_KEY);

        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password_hash', 'otp_hash', 'otp_expires'] }
        });
        
        if (!user) {
            throw new AppError(401, 'User belonging to this token does no longer exist.');
        }

        req.user = user.toJSON();

        console.log("[Auth] Verified token for user ID:", decoded.id);

        next();

    } catch(error){
        next(error);
    }
}



const isAdmin = (req, res, next) => {
  try {
    if (req.user && req.user.role === 'ADMIN') {
      
      console.log("[Auth] Admin verified - User ID:", req.user.id, "Role:", req.user.role);
      
      next();

    } else {
      throw new AppError(403, 'Forbidden. Admin access required.');
    }
  } catch (error) {
    next(error);
  }
};



module.exports = {
    authToken,
    isAdmin
}