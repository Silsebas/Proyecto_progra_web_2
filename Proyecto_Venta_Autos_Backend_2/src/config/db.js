const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Intentamos conectarnos usando la variable del archivo .env
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Base de datos MongoDB conectada exitosamente');
    } catch (error) {
        console.error('Error conectando a la base de datos:', error.message);
        process.exit(1); // Detener el servidor si la base de datos falla
    }
};

module.exports = connectDB;