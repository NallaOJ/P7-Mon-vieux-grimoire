const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

// Configuration de multer pour stocker les images dans le dossier 'images'
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

const upload = multer({ storage: storage }).single('image');

// Middleware sharp pour optimiser les images
const resizeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const filePath = req.file.path;
    const fileName = req.file.filename;
    const outputFilePath = path.join('images', `resized_${fileName}`);

    await sharp(filePath)
      .resize(260, 260)
      .toFile(outputFilePath);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return next(err);
      }

      req.file.path = outputFilePath;
      req.file.filename = `resized_${fileName}`;
      next();
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  upload,
  resizeImage
};
