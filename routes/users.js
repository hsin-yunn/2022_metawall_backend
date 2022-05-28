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

module.exports = router;
