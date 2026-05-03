// src/models/Vehicle.js
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  marca: {
    type: String,
    required: true,
    trim: true
  },
  modelo: {
    type: String,
    required: true,
    trim: true
  },
  anio: {
    type: Number,
    required: true
  },
  precio: {
    type: Number,
    required: true
  },
  kilometraje: {
    type: Number,
    required: true
  },
  motor: {
    type: String,
    required: true
  },
  combustible: {
    type: String,
    enum: ['Gasolina', 'Diesel', 'Eléctrico', 'Híbrido'], // Solo se permite estas opciones
    required: true
  },
  transmision: {
    type: String,
    enum: ['Manual', 'Automática'],
    required: true
  },
  descripcion: {
    type: String,
    required: true
  },
 // importante: cada vehículo debe estar asociado a un vendedor (usuario registrado)
  // Se Obliga a que el auto esté unido a un usuario registrado
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Lo conecta con el modelo de User.js
    required: true
  },
  // as imágenes serán un arreglo de textos (URLs)
  imagenes: [{
    type: String
  }],
  // Fecha en la que se publicó el auto
  fechaPublicacion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['disponible', 'vendido'],
    default: 'disponible'
  }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);