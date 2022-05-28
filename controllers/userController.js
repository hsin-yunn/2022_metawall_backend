const User = require('../models/user');
const appErrorHandle = require('../service/appErrorHandle');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

function jwtGenerate(user) {
  //產生 jwt token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_DAY,
  });
  return token;
}

//index
exports.index = async function (req, res, next) {
  const datas = await User.find();
  res.status(200).json({
    data: datas,
  });
};

//signup
exports.signup = async function (req, res, next) {
  //取得 signup 欄位
  const { password, passwordConfirm, name, email } = req.body;
  //validator
  if (!password || !passwordConfirm || !name || !email) {
    return next(appErrorHandle(400, 'data format is not correct', next));
  }
  if (!validator.isEmail(email)) {
    //判斷email
    return next(appErrorHandle(400, 'email format is not correct', next));
  }
  if (!validator.isLength(password, { min: 8 })) {
    //判斷密碼長度
    return next(appErrorHandle(400, 'password length is not correct', next));
  }
  if (password !== passwordConfirm) {
    //判斷 password,passwordConfirm
    return next(
      appErrorHandle(400, 'password and passwordConfirm is not same', next),
    );
  }
  const isExist = await User.findOne({ email: email });
  if (isExist) {
    return next(appErrorHandle(400, 'email is exist', next));
  }
  //password bcrypt
  const bcryptPassword = await bcrypt.hash(password, 12);
  //create user
  const user = await User.create({
    name: name,
    password: bcryptPassword,
    email: email,
  });
  const token = jwtGenerate(user);
  user.password = undefined;
  res.status(200).json({
    status: 'success',
    user: {
      token: token,
      name: user.name,
    },
  });
};

//signin
exports.signin = async function (req, res, next) {
  const { email, password } = req.body;
  //check email,password is required
  if (!email || !password) {
    return next(appErrorHandle(400, 'email or password is required', next));
  }
  const user = await User.findOne({ email }).select('+password');
  const isAuth = await bcrypt.compare(password, user.password);
  if (!isAuth || !user) {
    //failed
    return next(appErrorHandle(400, 'email or password is not correct', next));
  } else {
    //success -> send jwt
    const token = jwtGenerate(user);
    user.password = undefined;
    res.status(200).json({
      status: 'success',
      user: {
        token: token,
        name: user.name,
      },
    });
  }
};

//get user
exports.getUser = async function (req, res, next) {
  res.status(200).json({
    status: 'success',
    user: req.user,
  });
};

//update user
exports.updateUser = async function (req, res, next) {
  console.log(123123);
  const { gender, avatar, name } = req.body;
  if (!name) {
    return next(appErrorHandle(400, 'name is required', next));
  }
  const data = {
    gender,
    avatar,
    name,
  };
  const _id = req.user._id;
  const user = await User.findByIdAndUpdate(_id, data, {
    new: true,
  });
  console.log(user, 'user');
  res.status(200).json({
    data: user,
  });
};

//update password
exports.updatePassword = async function (req, res, next) {
  const { password, passwordConfirm } = req.body;
  //validator
  if (password !== passwordConfirm) {
    //判斷 password,passwordConfirm
    return next(
      appErrorHandle(400, 'password and passwordConfirm is not same', next),
    );
  }
  if (!validator.isLength(password, { min: 8 })) {
    //判斷密碼長度
    return next(appErrorHandle(400, 'password length is not correct', next));
  }
  const bcryptPassword = await bcrypt.hash(password, 12);
  const _id = req.user._id;
  const user = await User.findByIdAndUpdate(
    _id,
    {
      password: bcryptPassword,
    },
    {
      new: true,
    },
  );
  res.status(200).json({
    status: 'success',
    message: 'update success',
  });
};
