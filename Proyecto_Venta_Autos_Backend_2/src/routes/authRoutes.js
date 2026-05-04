const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generarToken } = require('../config/jwt');// Para generar el token de sesión (JWT)

// Importamos las funciones del controlador de autenticación
const { registrarUsuario, loginUsuario, verificarCodigo2FA, activarCuenta } = require('../controllers/authController');

// Importamos los middlewares de validación
const { validar, reglasRegistro, reglasLogin } = require('../middlewares/validaciones');

// --- RUTAS TRADICIONALES de autenticación ---
router.post('/register', reglasRegistro, validar, registrarUsuario);
router.post('/login', reglasLogin, validar, loginUsuario);
router.post('/verificar-2fa', verificarCodigo2FA);
router.get('/activar/:token', activarCuenta);

// --- RUTAS GOOGLE OAUTH ---
router.get('/auth/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', session: false }), 
    (req, res) => {
    console.log('=== CALLBACK GOOGLE ===');
    console.log('req.user:', req.user);
    console.log('tiene _id:', req.user?._id);

    // Si el usuario ya existe en la DB tiene _id
    if (req.user && req.user._id) {
        const token = generarToken(req.user._id);
        const nombre = encodeURIComponent(req.user.name);
        console.log('Usuario existente, enviando token');
        return res.redirect(`http://localhost:5173/?token=${token}&nombre=${nombre}`);
    }

    // Si es usuario nuevo solo tiene email y name temporales
    const email = encodeURIComponent(req.user.email);
    const name = encodeURIComponent(req.user.name);
    console.log('Usuario nuevo, redirigiendo a registro');
    res.redirect(`http://localhost:5173/registro?email=${email}&name=${name}`);
    }
);

module.exports = router;