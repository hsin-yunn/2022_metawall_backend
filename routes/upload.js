var express = require('express');
var router = express.Router();
const uploadController = require('../controllers/uploadController');
const handleErrorAsync = require('../service/handleErrorAsync');
const { isAuth } = require('../middlewares/auth');
const { imgUpload } = require('../middlewares/upload');

//upload image
router.post(
  '/upload/image',
  isAuth,
  imgUpload,
  handleErrorAsync(uploadController.imgUpload),
);

module.exports = router;
