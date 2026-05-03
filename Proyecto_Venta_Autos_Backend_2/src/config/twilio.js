const twilio = require('twilio');

const cliente = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const enviarCodigoSMS = async (telefono, codigo) => {
    await cliente.messages.create({
        body: `Tu código de verificación para Market Vehículos es: ${codigo}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: telefono
    });
};

module.exports = { enviarCodigoSMS };