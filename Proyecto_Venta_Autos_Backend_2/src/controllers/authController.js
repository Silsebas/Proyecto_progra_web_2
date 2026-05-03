// Importamos los modelos y librerías necesarias
const User = require('../models/User');
//const jwt = require('jsonwebtoken'); // Para manejar la seguridad con tokens
const axios = require('axios'); // Para comunicarnos con el microservicio de PHP (Padrón)
const sgMail = require('@sendgrid/mail'); // Para el envío de correos electrónicos
const { generarToken } = require('../config/jwt');// Para generar el token de sesión (JWT)
const { enviarCodigoSMS } = require('../config/twilio');
const { generarCodigo } = require('../utils/codigo');

// Configuramos SendGrid con la llave guardada en el archivo .env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


// --- FUNCIÓN PRINCIPAL: REGISTRAR USUARIO ---
const registrarUsuario = async (req, res) => {
    try {
        // 1. Extraemos los datos enviados desde el Frontend (React)
        const { name, email, password, cedula } = req.body;

        // --- PASO NUEVO: VALIDACIÓN CON EL PADRÓN ELECTORAL (MICROSERVICIO PHP) ---
        let nombreOficial = name; // Variable para guardar el nombre real del registro civil
        
        try {
            // Consultamos al API de PHP que configuramos en XAMPP
            const urlPadron = `http://localhost/padron/cedula/${cedula}`;
            const respuestaPadron = await axios.get(urlPadron);
            const datosPadron = respuestaPadron.data;

            // Si el API devuelve error o no encuentra la cédula, cancelamos el registro
            if (!datosPadron || datosPadron.error || datosPadron[0] === "No encontrado") {
                return res.status(400).json({ mensaje: 'La cédula no existe en el padrón electoral. Registro denegado.' });
            }

            // Si la encontró, construimos el nombre completo oficial
            nombreOficial = `${datosPadron.nombre} ${datosPadron.apellidoPaterno} ${datosPadron.apellidoMaterno}`;
            
        } catch (errorPadron) {
            console.error("Error de conexión con el API de Padrón:", errorPadron.message);
            return res.status(500).json({ mensaje: 'Error técnico al validar la cédula con el padrón electoral' });
        }

        // 2. Revisamos si el correo electrónico ya está en nuestra base de datos (MongoDB)
        const usuarioExiste = await User.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({ mensaje: 'El correo electrónico ya está registrado' });
        }

        // 3. Creamos el nuevo usuario usando el NOMBRE OFICIAL obtenido del Padrón
        const usuario = await User.create({
            name: nombreOficial, // Guardamos el nombre real validado por el TSE
            email,
            password,
            cedula,
            isActivated: false 
        }); 

        // --- PASO NUEVO: ENVÍO DE CORREO DE BIENVENIDA (SENDGRID) ---
        const msg = {
            to: email, // Correo del usuario que se acaba de registrar
            from: process.env.EMAIL_FROM, // Tu correo verificado en SendGrid
            subject: '¡Bienvenido a Market Vehículos! - Identidad Verificada',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #2c3e50;">Hola, ${nombreOficial}</h2>
                    <p>Gracias por registrarte en <strong>Market Vehículos</strong>.</p>
                    <p>Tu identidad ha sido verificada exitosamente con el número de cédula: <strong>${cedula}</strong>.</p>
                    <p>Ahora puedes publicar tus vehículos y gestionar tu perfil de forma segura.</p>
                    <br>
                    <a href="http://localhost:5173/login" style="background: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Iniciar Sesión</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #7f8c8d;">Este es un correo automático, por favor no lo respondas.</p>
                </div>
            `,
        };

        // Enviamos el correo de forma asíncrona
        await sgMail.send(msg);

        // 4. Respondemos al Frontend que todo salió bien
        res.status(201).json({
            mensaje: 'Usuario registrado y correo de bienvenida enviado',
            usuario: {
                id: usuario._id,
                name: usuario.name,
                email: usuario.email,
                token: generarToken(usuario._id)
            }
        });

    } catch (error) {
        console.error("Error en el proceso de registro:", error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor al intentar registrar al usuario' });
    }
};

// --- FUNCIÓN: LOGIN DE USUARIO ---
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await User.findOne({ email });

        if (!usuario) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        if (!usuario.isActivated) {
            return res.status(401).json({ mensaje: 'Cuenta no activada. Revisa tu correo.' });
        }

        const passwordCorrecta = await usuario.matchPassword(password);
        if (!passwordCorrecta) {
            return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });
        }

        // Generar código 2FA y guardarlo en el usuario con expiración de 10 minutos
        const codigo = generarCodigo();
        usuario.codigo2FA = codigo;
        usuario.expiracion2FA = new Date(Date.now() + 10 * 60 * 1000);
        await usuario.save();

        // Enviar el código por SMS
        await enviarCodigoSMS(usuario.telefono, codigo);

        // No devolvemos el token aún — esperamos la verificación del código
        res.status(200).json({
            mensaje: 'Código enviado por SMS. Ingresa el código para continuar.',
            requiere2FA: true,
            email: usuario.email
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ mensaje: 'Hubo un error en el servidor al iniciar sesión' });
    }
};

// --- FUNCIÓN VERIFICACIÓN DEL CÓDIGO 2FA ---
const verificarCodigo2FA = async (req, res) => {
    try {
        const { email, codigo } = req.body;

        const usuario = await User.findOne({ email });

        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Verificar que el código no haya expirado
        if (!usuario.expiracion2FA || usuario.expiracion2FA < new Date()) {
            return res.status(401).json({ mensaje: 'El código ha expirado. Intenta iniciar sesión de nuevo.' });
        }

        // Verificar que el código coincida
        if (usuario.codigo2FA !== codigo) {
            return res.status(401).json({ mensaje: 'Código incorrecto.' });
        }

        // Limpiar el código usado
        usuario.codigo2FA = null;
        usuario.expiracion2FA = null;
        await usuario.save();

        // Ahora sí devolvemos el token
        res.json({
            mensaje: 'Verificación exitosa',
            usuario: {
                id: usuario._id,
                name: usuario.name,
                email: usuario.email,
                token: generarToken(usuario._id)
            }
        });

    } catch (error) {
        console.error("Error en verificarCodigo2FA:", error);
        res.status(500).json({ mensaje: 'Error al verificar el código' });
    }
};

// Exportamos las funciones para usarlas en las rutas (routes/userRoutes.js)
module.exports = { registrarUsuario, loginUsuario, verificarCodigo2FA };