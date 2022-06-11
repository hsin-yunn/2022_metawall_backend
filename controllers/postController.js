const Post = require('../models/post');
const User = require('../models/user');
const appErrorHandle = require('../service/appErrorHandle');
const modelHelper = require('../helpers/modelHelper');
const mongoose = require('mongoose');

//controller setting
const requiredFields = [];

//index 所有貼文
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

//auth index 自己的貼文
exports.authIndex = async function (req, res, next) {
  const url = req.url;
  if (url.startsWith('/posts/')) {
    return next();
  }
  const filter = {
    user: req.user._id,
  };
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

//store 建立自己的貼文
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

//show 取得單一貼文
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

//delete all 刪除自己的所有貼文
exports.deleteAll = async function (req, res, next) {
  const url = req.url;
  if (url.startsWith('/posts/')) {
    return next();
  }
  await Post.deleteMany({
    _id: req.user._id,
  });
  res.status(201).json({
    data: [],
  });
};

//delete one 刪除自己的單一貼文
exports.deleteOne = async function (req, res, next) {
  const _id = req.params.id;
  try {
    const post = await Post.findById(_id);
    if (post.user !== req.user._id) {
      return next(appErrorHandle(400, 'not your post', next));
    }
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

//update 編輯自己的貼文
exports.update = async function (req, res, next) {
  let data = req.body;
  //check require fields
  modelHelper.checkRequiredField(data, requiredFields, next);
  //check body user is auth user
  const userId = req.body.user;
  if (userId !== req.user._id) {
    return next(appErrorHandle(400, 'user should be auth _id', next));
  }
  //other check
  if (!data.content && !data.image) {
    return next(appErrorHandle(400, 'data or image is required', next));
  }
  try {
    const _id = req.params.id;
    //check is my post
    const checkPost = await Post.findById(_id);
    if (checkPost.user !== req.user._id) {
      return next(appErrorHandle(400, 'not your post', next));
    }
    //update post
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

//like 新增一則貼文的讚
exports.like = async function (req, res, next) {
  //check id
  const _id = req.params.id;
  const isValid = mongoose.Types.ObjectId.isValid(_id);
  if (!_id || !isValid) {
    return next(appErrorHandle(400, 'id is required or invalid', next));
  }
  //check post is exist
  const post = await Post.findById(_id);
  if (!post) {
    return next(appErrorHandle(400, 'data is not exist', next));
  }
  //upate like
  await Post.findByIdAndUpdate(_id, { $addToSet: { likes: req.user._id } });
  res.status(200).json({
    status: 'success',
    postId: _id,
    userId: req.user._id,
  });
};

//unlike 刪除一則貼文的讚
exports.unlike = async function (req, res, next) {
  //check id
  const _id = req.params.id;
  const isValid = mongoose.Types.ObjectId.isValid(_id);
  if (!_id || !isValid) {
    return next(appErrorHandle(400, 'id is required or invalid', next));
  }
  //check post is exist
  const post = await Post.findById(_id);
  if (!post) {
    return next(appErrorHandle(400, 'data is not exist', next));
  }
  //upate like
  await Post.findByIdAndUpdate(_id, { $pull: { likes: req.user._id } });
  res.status(200).json({
    status: 'success',
    postId: _id,
    userId: req.user._id,
  });
};
