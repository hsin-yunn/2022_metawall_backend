const multer = require('multer');
const path = require('path');
exports.imgUpload = multer({
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
      cb(
        new Error(
          'file format is not correct，only can upload jpg、jpeg and png format.',
        ),
      );
    }
    cb(null, true);
  },
}).any();
