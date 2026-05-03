// src/middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configuración de dónde y cómo se guardan los archivos
const storage = multer.diskStorage({
  // Carpeta de destino
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  // Nombre del archivo (le ponemos la fecha para que no haya nombres repetidos)
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('No es una imagen. Por favor sube solo imágenes.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter 
});

module.exports = upload;