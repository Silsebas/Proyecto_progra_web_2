const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); //Importamos la librería de encriptación de contraseñas

// 1. Creamos el Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Es obligatorio, no puede quedar vacío
        trim: true // Borra los espacios en blanco al inicio y al final si el usuario se equivoca
    },
    email: {
        type: String,
        required: true,
        unique: true, // No pueden existir dos usuarios con el mismo correo
        trim: true,
        lowercase: true // Convierte el correo a minúsculas automáticamente
    },
    password: {
        type: String,
        required: true
    },
    cedula: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    isActivated: {
        type: Boolean,
        default: true
    },
    telefono: {
        type: String,
        trim: true
    },
    codigo2FA: {
        type: String
    },
    expiracion2FA: {
        type: Date
    }
}, {
    timestamps: true 
});

// Función que se ejecuta ANTES de guardar en la base de datos
userSchema.pre('save', async function(){//(next) {
    // Si la contraseña no se está modificando/creando, continuamos sin hacer nada
    if (!this.isModified('password')) {
        return; //next();
    }
    
    // Generamos un texto aleatorio (salt) para mezclarlo con la contraseña y hacerla más segura
    const salt = await bcrypt.genSalt(10);
    // Reemplazamos la contraseña plana por la contraseña encriptada
    this.password = await bcrypt.hash(this.password, salt);
    //next();
});

// Función que usaremos en el Login para comparar contraseñas
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);