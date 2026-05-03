// src/routes/vehicleRoutes.js
const { validar, reglasVehiculo } = require('../middlewares/validaciones');
const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/uploads');

// NOTA: Para la ruta POST, se necesita poner el Middleware en el medio.
// Por ahora la dejaremos así para armar la estructura.

// Ruta POST: http://localhost:4000/api/vehicles (Para publicar)
// Le ponemos el middleware 'auth' en el medio y Le decimos que busque un archivo llamado 'imagen' usando upload.single()
router.post('/', auth, upload.single('imagen'), reglasVehiculo, validar, vehicleController.crearVehiculo);

// Ruta GET: http://localhost:4000/api/vehicles (Para ver el catálogo)
// Esta queda libre para que cualquiera pueda ver el catálogo
router.get('/', vehicleController.obtenerVehiculos);

// Ruta PUT: http://localhost:4000/api/vehicles/:id/vendido (Para marcar como vendido)
router.put('/:id', auth, upload.single('imagen'), reglasVehiculo, validar, vehicleController.actualizarVehiculo);

// En tu archivo de rutas de vehículos del backend
router.delete('/:id', auth, vehicleController.eliminarVehiculo);

// src/routes/vehicleRoutes.js

// 1. Ruta para actualizar datos generales (Editar)
router.put('/:id', auth, upload.single('imagen'), vehicleController.actualizarVehiculo);

module.exports = router;