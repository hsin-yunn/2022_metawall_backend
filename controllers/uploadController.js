const appErrorHandle = require('../service/appErrorHandle');
const sizeOf = require('image-size');
const { ImgurClient } = require('imgur');

exports.imgUpload = async function (req, res, next) {
  //check has files
  if (!req.files.length) {
    return next(appErrorHandle(400, 'files required', next));
  }
  //check image width
  const dimensions = sizeOf(req.files[0].buffer);
  if (dimensions.width !== dimensions.height) {
    return next(appErrorHandle(400, 'image size is not 1:1', next));
  }
  const client = new ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID,
    clientSecret: process.env.IMGUR_CLIENT_SECRET,
    refreshToken: process.env.IMGUR_REFRESH_TOKEN,
  });
  const response = await client.upload({
    image: req.files[0].buffer.toString('base64'),
    type: 'base64',
    album: process.env.IMGUR_ALBUM_ID,
  });
  if (!response.data || !response.data.link) {
    return next(appErrorHandle(400, 'upload error', next));
  }
  res.status(200).json({
    status: 'success',
    data: response.data.link,
  });
};
