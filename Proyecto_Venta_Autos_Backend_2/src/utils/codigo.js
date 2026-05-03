// Genera un código numérico aleatorio de 6 dígitos
const generarCodigo = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { generarCodigo };