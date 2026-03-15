const multer = require('multer');
const AppError = require('../utils/appError');


const storage = multer.memoryStorage();


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image or video! Please upload only images or videos.', 400), false);
  }
};


const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});


module.exports = upload;