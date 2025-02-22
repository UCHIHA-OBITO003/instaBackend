const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'instagram_clone', // folder name in Cloudinary
    resource_type: 'auto'      // allows image or video uploads
  },
});

const upload = multer({ storage });

module.exports = upload;
