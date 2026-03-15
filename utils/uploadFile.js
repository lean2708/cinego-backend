const cloudinary = require('../config/cloudinary');
const AppError = require('./appError');


const uploadToCloudinary = (buffer, folder, resource_type = 'image') => {
  return new Promise((resolve, reject) => {
    
    const options = {
        folder: folder,
        resource_type: resource_type
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(new AppError(500, 'Upload lên Cloudinary thất bại'));
        }
        resolve(result); 
      }
    );

    uploadStream.end(buffer);
  });
};

module.exports = { uploadToCloudinary };