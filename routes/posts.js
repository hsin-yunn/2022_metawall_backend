var express = require('express');
var router = express.Router();
const postController = require('../controllers/postController');
const handleErrorAsync = require('../service/handleErrorAsync');
const { isAuth } = require('../middlewares/auth');

//index
router.get('/posts', isAuth, handleErrorAsync(postController.index));
//auth index
router.get('/auth/posts', isAuth, handleErrorAsync(postController.authIndex));
//store
router.post('/posts', isAuth, handleErrorAsync(postController.store));
//show
router.get('/posts/:id', isAuth, handleErrorAsync(postController.show));
//delete all
router.delete('/posts', isAuth, handleErrorAsync(postController.deleteAll));
//delete
router.delete('/posts/:id', isAuth, handleErrorAsync(postController.deleteOne));
//update
router.patch('/posts/:id', isAuth, handleErrorAsync(postController.update));
//like
router.post('/posts/:id/like', isAuth, handleErrorAsync(postController.like));
//unlike
router.delete(
  '/posts/:id/unlike',
  isAuth,
  handleErrorAsync(postController.unlike),
);

module.exports = router;
