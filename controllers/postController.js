const Post = require('../models/post');
const User = require('../models/user');
const appErrorHandle = require('../service/appErrorHandle');
const modelHelper = require('../helpers/modelHelper');

//controller setting
const requiredFields = [];

//index
exports.index = async function (req, res, next) {
  const url = req.url;
  if (url.startsWith('/posts/')) {
    return next();
  }
  const filter = {};
  //search
  if (req.query.search) {
    const search = req.query.search;
    filter.content = {
      $regex: search,
    };
  }
  //sort
  const sort = {};
  if (req.query.orderWay && req.query.orderBy) {
    sort[req.query.orderBy] = req.query.orderWay === 'asc' ? 1 : -1;
  }
  const datas = await Post.find(filter)
    .populate({
      path: 'user likes',
      select: 'name -_id',
    })
    .sort(sort);
  res.status(200).json({
    data: datas,
  });
};

//store
exports.store = async function (req, res, next) {
  let data = req.body;
  //check require fields
  modelHelper.checkRequiredField(data, requiredFields, next);
  //check user is exist
  const userId = req.user._id;
  try {
    await User.findById(userId).exec();
  } catch {
    return next(appErrorHandle(400, 'user is not exist', next));
  }
  data.user = userId;
  //other check
  if (!data.content && !data.image) {
    return next(appErrorHandle(400, 'data or image is required', next));
  }
  const post = await Post.create(data);
  res.status(201).json({
    data: post,
  });
};

//show
exports.show = async function (req, res, next) {
  const _id = req.params.id;
  if (!_id) {
    next(appErrorHandle(400, 'id is required', next));
  }
  try {
    const post = await Post.findById(_id).exec();
    if (!post) {
      return next(appErrorHandle(400, 'data is not exist', next));
    }
    res.status(200).json({
      data: post,
    });
  } catch {
    return next(appErrorHandle(400, 'data is not exist', next));
  }
};

//delete all
exports.deleteAll = async function (req, res, next) {
  const url = req.url;
  if (url.startsWith('/posts/')) {
    return next();
  }
  await Post.deleteMany({});
  res.status(201).json({
    data: [],
  });
};

//delete one
exports.deleteOne = async function (req, res, next) {
  const _id = req.params.id;
  try {
    await Post.findByIdAndDelete(_id).then((data) => {
      if (!data) {
        return next(appErrorHandle(400, 'data is not exist', next));
      } else {
        res.status(200).json({
          status: 'success',
          message: 'data delete',
        });
      }
    });
  } catch {
    return next(appErrorHandle(400, 'data is not exist', next));
  }
};

//update
exports.update = async function (req, res, next) {
  let data = req.body;
  //check require fields
  modelHelper.checkRequiredField(data, requiredFields, next);
  //check user is exist
  const userId = req.body.user;
  try {
    await User.findById(userId).exec();
  } catch {
    return next(appErrorHandle(400, 'user is not exist', next));
  }
  //other check
  if (!data.content && !data.image) {
    return next(appErrorHandle(400, 'data or image is required', next));
  }
  try {
    const _id = req.params.id;
    const post = await Post.findByIdAndUpdate(_id, data, {
      new: true,
    });
    if (!post) {
      return next(appErrorHandle(400, 'data is not exist', next));
    } else {
      res.status(200).json({
        data: post,
      });
    }
  } catch (err) {
    return next(appErrorHandle(400, 'data format is not exist', next));
  }
};
