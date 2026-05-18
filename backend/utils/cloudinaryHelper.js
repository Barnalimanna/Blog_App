const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (fileBuffer, folder = 'avatars') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  return await cloudinary.uploader.destroy(publicId);
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
};