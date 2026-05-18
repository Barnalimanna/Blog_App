const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }

  cb(new Error('Only image files are allowed!'));
};

const upload = multer({
  storage,
  limits: { 
    fieldSize: 10*1024*1024,
    fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;