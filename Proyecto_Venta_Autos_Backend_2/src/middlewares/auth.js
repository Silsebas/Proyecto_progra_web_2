// src/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // 1. Leer el token que el frontend nos envía en la "cabecera" (header)
    const token = req.header('x-auth-token'); 
    //let token = req.header('x-auth-token');

    // 2. Revisar si no hay token (el usuario es un visitante no registrado)
    if (!token) {
        return res.status(401).json({ mensaje: 'No hay token, permiso denegado. Debes iniciar sesión.' });
    }
    //Le quitamos cualquier comilla doble que React le haya pegado
    //token = token.replace(/"/g, '');

    // 3. Validar si el token es real y no ha sido alterado
    try {
        // IMPORTANTE: Aquí usamos la misma variable de entorno secreta que creamos 
        // el token en authController de login/registro. la variable esta en .env
        const cifrado = jwt.verify(token, process.env.JWT_SECRET);
        
    // Extraer el 'id' correctamente de la raíz del token descifrado
        req.usuario = { id: cifrado.id };
        
        // next() lo déjamos pasar a la ruta"
        next(); 
    } catch (error) {
        res.status(401).json({ mensaje: 'Token no válido o expirado' });
    }
};