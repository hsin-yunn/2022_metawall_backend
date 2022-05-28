const Post = require('../models/post');
const User = require('../models/user');
const appErrorHandle = require('../service/appErrorHandle');
const mongoose = require('mongoose');

//index 取得單一貼文底下的所有留言

//store 建立留言
exports.store = async function (req, res, next) {
  const postId = req.params.id;
  //check postId is correct
  const isValid = mongoose.Types.ObjectId.isValid(postId);
  if (!postId || !isValid) {
    next(appErrorHandle(400, 'id is required or invalid', next));
  }
  //check post is exist
  const post = await Post.findById(postId);
  if (!post) {
    return next(appErrorHandle(400, 'data is not exist', next));
  }
  //create comment
  const data = req.body;
  //add auth to data's user
  data.user = req.user._id;
  const comment = await Comment.create(data);
  res.status(201).json({
    data: comment,
  });
};

//show 取得單一留言
//update 編輯留言
//delete 刪除留言
