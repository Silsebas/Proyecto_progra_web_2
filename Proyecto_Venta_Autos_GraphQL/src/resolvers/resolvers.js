const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Chat = require('../models/Chat');

const resolvers = {
    Query: {

        // Lista vehículos con filtros opcionales y paginación
        vehiculos: async (_, args) => {
            try {

                const {
                    marca,
                    estado,
                    precioMin,
                    precioMax,
                    anioMin,
                    anioMax,
                    pagina = 1
                } = args;

                const filtros = {};
                const limite = 6;
                const saltar = (pagina - 1) * limite;

                if (marca) filtros.marca = { $regex: marca, $options: 'i' };
                if (estado) filtros.estado = estado;
                if (precioMin || precioMax) {
                    filtros.precio = {};
                    if (precioMin) filtros.precio.$gte = precioMin;
                    if (precioMax) filtros.precio.$lte = precioMax;
                }
                if (anioMin || anioMax) {
                    filtros.anio = {};
                    if (anioMin) filtros.anio.$gte = anioMin;
                    if (anioMax) filtros.anio.$lte = anioMax;
                }

                const total = await Vehicle.countDocuments(filtros);

                //console.log('Total vehículos en DB:', total); // línea para ver errores de conteo activar cuando este dando error

                const vehiculos = await Vehicle.find(filtros)
                    .populate('vendedor', 'name email')
                    .sort({ createdAt: -1 })
                    .skip(saltar)
                    .limit(limite);

                return {
                    vehiculos,
                    totalPaginas: Math.ceil(total / limite),
                    paginaActual: pagina,
                    total
                };

            } catch (error) {
                throw new Error('Error al obtener vehículos: ' + error.message);
            }
        },

        // Detalle de un vehículo por ID
        vehiculo: async (_, { id }) => {
            try {
                const vehiculo = await Vehicle.findById(id)
                    .populate('vendedor', 'name email');

                if (!vehiculo) throw new Error('Vehículo no encontrado');
                return vehiculo;

            } catch (error) {
                throw new Error('Error al obtener vehículo: ' + error.message);
            }
        },

        // Vehículos publicados por el usuario autenticado
        misVehiculos: async (_, __, context) => {
            if (!context.usuario) throw new Error('No autorizado. Debes iniciar sesión.');

            try {
                const vehiculos = await Vehicle.find({ vendedor: context.usuario.id })
                    .populate('vendedor', 'name email')
                    .sort({ createdAt: -1 });

                return vehiculos;

            } catch (error) {
                throw new Error('Error al obtener tus vehículos: ' + error.message);
            }
        },

        // Chats del usuario autenticado
        misChats: async (_, __, context) => {
            if (!context.usuario) throw new Error('No autorizado. Debes iniciar sesión.');

            try {
                const chats = await Chat.find({
                    $or: [
                        { comprador: context.usuario.id },
                        { vendedor: context.usuario.id }
                    ]
                })
                .populate('vehiculo', 'marca modelo imagen')
                .populate('comprador vendedor', 'name email')
                .populate('mensajes.emisor', 'name')
                .sort({ ultimaActualizacion: -1 });

                return chats;

            } catch (error) {
                throw new Error('Error al obtener chats: ' + error.message);
            }
        },

        // Perfil del usuario autenticado
        miPerfil: async (_, __, context) => {
            if (!context.usuario) throw new Error('No autorizado. Debes iniciar sesión.');

            try {
                const usuario = await User.findById(context.usuario.id)
                    .select('-password -codigo2FA -expiracion2FA');

                if (!usuario) throw new Error('Usuario no encontrado');
                return usuario;

            } catch (error) {
                throw new Error('Error al obtener perfil: ' + error.message);
            }
        }
    }
};

module.exports = resolvers;