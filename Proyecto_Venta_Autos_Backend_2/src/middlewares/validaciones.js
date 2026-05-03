const { body, validationResult } = require('express-validator');

// Middleware reutilizable que revisa si hay errores y los devuelve
const validar = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
        return res.status(400).json({ errores: errores.array() });
    }
    next();
};

// Reglas para el registro de usuario con email y telefono
const reglasRegistro = [
    body('email')
        .isEmail()
        .withMessage('Debe ser un correo electrónico válido')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres'),

    body('cedula')
        .isLength({ min: 9, max: 9 })
        .withMessage('La cédula debe tener exactamente 9 dígitos')
        .isNumeric()
        .withMessage('La cédula solo puede contener números'),

    body('name')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .trim(),

    body('telefono')
        .notEmpty()
        .withMessage('El teléfono es obligatorio')
        .matches(/^\+?[\d\s\-]{8,15}$/)
        .withMessage('El teléfono no tiene un formato válido')    
];

// Reglas para el uso del login
const reglasLogin = [
    body('email')
        .isEmail()
        .withMessage('Debe ser un correo electrónico válido')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
];

// Reglas para publicar un vehículo
const reglasVehiculo = [
    body('marca')
        .notEmpty()
        .withMessage('La marca es obligatoria')
        .trim(),

    body('modelo')
        .notEmpty()
        .withMessage('El modelo es obligatorio')
        .trim(),

    body('anio')
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage(`El año debe estar entre 1900 y ${new Date().getFullYear()}`),

    body('precio')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número mayor a 0'),

    body('kilometraje')
        .isInt({ min: 0 })
        .withMessage('El kilometraje debe ser un número mayor o igual a 0')
];

module.exports = { validar, reglasRegistro, reglasLogin, reglasVehiculo };