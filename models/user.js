const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    name: {
      type: String,
      required: [true, '名稱必填'],
    },
    avatar: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
      required: [true, '密碼必填'],
    },
    email: {
      type: String,
      default: [true, '信箱必填'],
      index: { unique: true },
    },
    gender: {
      type: String,
      enum: ['female', 'male'],
    },
  },
  {
    versionKey: false,
  },
);

const User = mongoose.model('User', schema);

module.exports = User;
