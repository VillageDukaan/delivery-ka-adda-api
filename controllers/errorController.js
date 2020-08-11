const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. please use another value!`
  return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please Log in again', 401)

const handleJWTExpiredError = () => new AppError('Your token has Expired. Please login again!', 401)

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
}

const sendErrorProd = (err, res) => {
  // Operational error, Send message to client
  if(err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  // Programming or other unknown error, don't leak details to client
  } else {
    console.log('Error', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    })
  }
}


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
  
    if(process.env.NODE_ENV === "development") {
      sendErrorDev(err, res);
    } else if(process.env.NODE_ENV === "production") {
      let error = {...err};

      if (error.name === "CastError") error = handleCastErrorDB(error);
      if (error.code === 11000) error = handleDuplicateFieldsDB(error)
      if (error.name === "ValidationError") error = handleValidationErrorDB(error);
      if (error.name === "JsonWebTokenError") error = handleJWTError(error)
      if (error.name === "TokenExpiredError") error = handleJWTExpiredError(error)

      sendErrorProd(error, res);
    }
  }