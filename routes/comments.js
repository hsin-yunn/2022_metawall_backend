var express = require('express');
var router = express.Router();
const commetnController = require('../controllers/commentController');
const handleErrorAsync = require('../service/handleErrorAsync');
const { isAuth } = require('../middlewares/auth');

//store
router.post(
  '/posts/:id/comment',
  isAuth,
  handleErrorAsync(commetnController.store),
);

module.exports = router;
