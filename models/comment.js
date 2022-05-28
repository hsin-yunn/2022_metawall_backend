const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, '留言者必填'],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, '所屬貼文必填'],
    },
  },
  {
    versionKey: false,
  },
);

const Comment = mongoose.model('Comment', schema);

module.exports = Comment;
