const User = require('../models/user');
const appErrorHandle = require('../service/appErrorHandle');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const Post = require('../models/post');
const mongoose = require('mongoose');

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

//getLikeList 取得個人按讚貼文列表
exports.getLikeList = async function (req, res, next) {
  const likeList = await Post.find({
    likes: {
      $in: [req.user._id],
    },
  }).populate({
    path: 'user',
    select: 'name _id',
  });
  res.status(200).json({
    status: 'success',
    data: likeList,
  });
};

//follow 追蹤其他人
exports.follow = async function (req, res, next) {
  //判斷此使用者是否存在
  const isValid = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!req.params.id || !isValid) {
    return next(appErrorHandle(400, 'id is required or invalid', next));
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(appErrorHandle(400, 'user is not exist', next));
  }
  //判斷不能追蹤自己
  if (req.params.id === req.user.id) {
    return next(appError(401, 'can not follow yourself', next));
  }
  await User.updateOne(
    {
      _id: req.user.id,
      'following.user': { $ne: req.params.id },
    },
    {
      $addToSet: { following: { user: req.params.id } },
    },
  );
  await User.updateOne(
    {
      _id: req.params.id,
      'followers.user': { $ne: req.user.id },
    },
    {
      $addToSet: { followers: { user: req.user.id } },
    },
  );
  res.status(200).json({
    status: 'success',
    message: 'follow success',
  });
};

//unfollow取消追蹤
exports.unfollow = async function (req, res, next) {
  //判斷此使用者是否存在
  const isValid = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!req.params.id || !isValid) {
    return next(appErrorHandle(400, 'id is required or invalid', next));
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(appErrorHandle(400, 'user is not exist', next));
  }
  //判斷不能取消追蹤自己
  if (req.params.id === req.user.id) {
    return next(appError(401, 'can not unfollow yourself', next));
  }
  await User.updateOne(
    {
      _id: req.user.id,
    },
    {
      $pull: {
        following: {
          user: req.params.id,
        },
      },
    },
  );
  await User.updateOne(
    {
      _id: req.params.id,
    },
    {
      $pull: {
        followers: {
          user: req.user.id,
        },
      },
    },
  );
  res.status(200).json({
    status: 'success',
    message: 'unfollow success',
  });
};

//getFollowList取得自己的追蹤列表
exports.getFollowList = async function (req, res, next) {
  const followList = await User.find({
    followers: {
      $in: [req.user._id],
    },
  });
  res.status(200).json({
    status: 'success',
    data: followList,
  });
};
