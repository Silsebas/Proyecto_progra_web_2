const Chat = require('../models/Chat');

// POST /api/chats — Crea una conversación nueva
exports.crearChat = async (req, res) => {
    const { vehiculoId, vendedorId, mensajeInicial, esOrden } = req.body;
    const emisorId = req.usuario.id;

    try {
        // Verificar si ya existe un chat para este vehículo entre estos usuarios
        let chat = await Chat.findOne({
            vehiculo: vehiculoId,
            comprador: emisorId,
            vendedor: vendedorId
        });

        // Si ya existe, simplemente lo devolvemos sin crear uno nuevo
        if (chat) {
            const chatExistente = await Chat.findById(chat._id)
                .populate('vehiculo', 'marca modelo imagenes')
                .populate('comprador vendedor', 'name');
            return res.status(200).json(chatExistente);
        }

        // Si no existe, creamos uno nuevo con el mensaje inicial
        chat = new Chat({
            vehiculo: vehiculoId,
            comprador: emisorId,
            vendedor: vendedorId,
            mensajes: [{
                emisor: emisorId,
                texto: mensajeInicial,
                esOrdenCompra: esOrden || false
            }]
        });

        chat.ultimaActualizacion = Date.now();
        await chat.save();

        const chatLimpio = await Chat.findById(chat._id)
            .populate('vehiculo', 'marca modelo imagenes')
            .populate('comprador vendedor', 'name');

        res.status(201).json(chatLimpio);

    } catch (error) {
        console.error("Error en crearChat:", error);
        res.status(500).json({ mensaje: 'Error al crear el chat' });
    }
};

// POST /api/chats/:id/mensajes — Agrega un mensaje a un chat existente
exports.enviarMensaje = async (req, res) => {
    const { mensajeInicial, esOrden } = req.body;
    const emisorId = req.usuario.id;

    try {
        const chat = await Chat.findById(req.params.id);

        if (!chat) {
            return res.status(404).json({ mensaje: 'Chat no encontrado' });
        }

        // Regla de turnos — no puedes enviar dos mensajes seguidos
        if (chat.mensajes.length > 0) {
            const ultimoMensaje = chat.mensajes[chat.mensajes.length - 1];
            if (String(ultimoMensaje.emisor) === String(emisorId)) {
                return res.status(400).json({
                    mensaje: 'Debes esperar a que la otra persona responda.'
                });
            }
        }

        chat.mensajes.push({
            emisor: emisorId,
            texto: mensajeInicial,
            esOrdenCompra: esOrden || false
        });

        chat.ultimaActualizacion = Date.now();
        await chat.save();

        const chatLimpio = await Chat.findById(chat._id)
            .populate('vehiculo', 'marca modelo imagenes')
            .populate('comprador vendedor', 'name');

        res.status(200).json(chatLimpio);

    } catch (error) {
        console.error("Error en enviarMensaje:", error);
        res.status(500).json({ mensaje: 'Error al enviar el mensaje' });
    }
};

// GET /api/chats — Obtiene todos los chats del usuario
exports.obtenerMisChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            $or: [
                { comprador: req.usuario.id },
                { vendedor: req.usuario.id }
            ]
        })
        .populate('vehiculo', 'marca modelo imagenes')
        .populate('comprador vendedor', 'name')
        .sort({ ultimaActualizacion: -1 });

        res.status(200).json(chats);

    } catch (error) {
        console.error("Error en obtenerMisChats:", error);
        res.status(500).json({ mensaje: 'Error al obtener los chats' });
    }
};