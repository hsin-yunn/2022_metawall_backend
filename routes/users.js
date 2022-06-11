var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const handleErrorAsync = require('../service/handleErrorAsync');
const { isAuth } = require('../middlewares/auth');

//index
router.get('/users', isAuth, handleErrorAsync(userController.index));
//signin
router.post('/signin', handleErrorAsync(userController.signin));
//signup
router.post('/signup', handleErrorAsync(userController.signup));
//getuser
router.get('/auth/user', isAuth, handleErrorAsync(userController.getUser));
//update
router.patch('/auth/user', isAuth, handleErrorAsync(userController.updateUser));
//update password
router.post(
  '/auth/user/reset_password',
  isAuth,
  handleErrorAsync(userController.updatePassword),
);
//getLikeList 取得個人按讚貼文列表
router.get(
  '/users/getLikeList',
  isAuth,
  handleErrorAsync(userController.getLikeList),
);
//follow 追蹤他人
router.post('/:id/follow', isAuth, handleErrorAsync(userController.follow));
//unfollow 取消追蹤
router.post('/:id/unfollow', isAuth, handleErrorAsync(userController.unfollow));
//getFollowList 取得個人追蹤列表
router.get(
  '/users/getFollowList',
  isAuth,
  handleErrorAsync(userController.getFollowList),
);

module.exports = router;
