const express = require('express');
const router = express.Router();
const passport = require('passport');
const { generarToken } = require('../config/jwt');// Para generar el token de sesión (JWT)

// Importamos las funciones del controlador de autenticación
const { registrarUsuario, loginUsuario, verificarCodigo2FA } = require('../controllers/authController');

// Importamos los middlewares de validación
const { validar, reglasRegistro, reglasLogin } = require('../middlewares/validaciones');

// --- RUTAS TRADICIONALES de autenticación ---
router.post('/register', reglasRegistro, validar, registrarUsuario);
router.post('/login', reglasLogin, validar, loginUsuario);
router.post('/verificar-2fa', verificarCodigo2FA);

// --- RUTAS GOOGLE OAUTH ---
router.get('/auth/google', passport.authenticate('google', { 
    scope: ['profile', 'email'] 
}));

router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login', session: false }), 
    (req, res) => {
        
        if (req.user._id) {
            // Si no encuentras la función 'generarToken', podemos crear el token aquí mismo:
            const token = generarToken(req.user._id);
            
            const nombre = req.user.name;
            return res.redirect(`http://localhost:5173/?token=${token}&nombre=${nombre}`);
        }

        const { email, name } = req.user;
        res.redirect(`http://localhost:5173/?email=${email}&name=${name}`);
    }
);

module.exports = router;