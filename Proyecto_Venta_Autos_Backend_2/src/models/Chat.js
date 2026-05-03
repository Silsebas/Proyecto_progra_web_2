const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    vehiculo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: true
    },
    comprador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mensajes: [
        {
            emisor: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            texto: String,
            fecha: {
                type: Date,
                default: Date.now
            },
            esOrdenCompra: { // Para saber si es el mensaje del carrito
                type: Boolean,
                default: false
            }
        }
    ],
    ultimaActualizacion: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);