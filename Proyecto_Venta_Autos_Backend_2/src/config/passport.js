const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Verifica que la ruta a tu modelo sea correcta

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/api/users/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        // Extraemos los datos que nos da Google
        const { id, displayName, emails } = profile;
        const email = emails[0].value;

        // Buscamos si el usuario ya existe en nuestra base de datos de MongoDB
        let usuario = await User.findOne({ email });

        if (usuario) {
            // Si ya existe, simplemente lo dejamos pasar
            return done(null, usuario);
        } else {
            // Si NO existe, creamos un objeto temporal con sus datos de Google
            // OJO: No tiene cédula todavía, por eso en el router lo mandaremos a validar
            const nuevoUsuario = {
                googleId: id,
                name: displayName,
                email: email,
                isNewUser: true // Bandera para saber que falta la cédula
            };
            return done(null, nuevoUsuario);
        }
    } catch (error) {
        return done(error, null);
    }
  }
));

// Estas funciones son necesarias para que Passport maneje la sesión
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});