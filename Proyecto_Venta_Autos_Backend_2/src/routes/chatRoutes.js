const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middlewares/auth');

// POST /api/chats — Crear nueva conversación
router.post('/', auth, chatController.crearChat);

// POST /api/chats/:id/mensajes — Enviar mensaje a conversación existente
router.post('/:id/mensajes', auth, chatController.enviarMensaje);

// GET /api/chats — Ver todas mis conversaciones
router.get('/', auth, chatController.obtenerMisChats);

module.exports = router;