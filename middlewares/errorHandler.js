

const errorHandler = (err, req, res, next) =>{
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;

    console.error(`\n[${timestamp}] ERROR AT: ${method} ${url}`);
    console.error(`MESSAGE: ${err.message}`);
    
    if (err.stack) {
        const stackLines = err.stack.split('\n').slice(0, 4).join('\n');
        console.error(`TRACES AT THE STREAM:\n${stackLines}`);
    }

    let statusCode = 500;
    let message = 'Internal Server Error';


    // AppError
    if(err.isOperational){
        statusCode = err.statusCode;
        message = err.message;
    }

    else if (err.name === 'SequelizeValidationError') {
        statusCode = 400; // Bad Request
        message = err.errors[0]?.message || 'Invalid input data';
    }

    else if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409; // Conflict
        message = err.errors[0]?.message || 'Data already exists (e.g., email/phone)';
    }

    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401; // Unauthorized
        message = 'Invalid token. Please log in again.';
    }

    else if (err.name === 'TokenExpiredError') {
        statusCode = 401; // Unauthorized
        message = 'Token has expired. Please log in again.';
    }

    res.status(statusCode).json({
        status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
        message: message,
   });

};
   

module.exports = errorHandler;