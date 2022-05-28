const handleErrorAsync = function handleErrorAsync(func) {
  // middleware 先接住 router 資料
  // 執行的是return的這個function，由他去接req,res,next
  return function (req, res, next) {
    func(req, res, next).catch(function (error) {
      return next(error);
    });
  };
};

module.exports = handleErrorAsync;
