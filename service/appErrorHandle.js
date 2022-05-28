const appErrorHandle = (statusCode, errorMessage, next) => {
  const error = new Error(errorMessage);
  error.statusCode = statusCode;
  //是操作上且可預期的錯誤
  error.isOperational = true;
  next(error);
};

module.exports = appErrorHandle;
