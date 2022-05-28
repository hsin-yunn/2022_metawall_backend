const jwt = require('jsonwebtoken');
const appErrorHandle = require('../service/appErrorHandle');
const handleErrorAsync = require('../service/handleErrorAsync');
const User = require('../models/user');

//驗證是否已登入
exports.isAuth = handleErrorAsync(async (req, res, next) => {
  // check token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(appErrorHandle(401, 'Unauthenticated', next));
  }

  //verify token
  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
      if (err) {
        reject(err);
      } else {
        resolve(payload);
      }
    });
  });

  const user = await User.findById(decoded.id);

  if (!user) {
    return next(appErrorHandle(400, 'user is not exist', next));
  }

  req.user = user;
  next();
});
